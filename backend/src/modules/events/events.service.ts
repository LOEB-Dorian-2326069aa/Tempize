import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event } from './entities/event.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { Participation } from '../participations/entities/participation.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { StatutEvenement, StatutParticipation, TypeAcces } from '../../common/enums';
import { RedisService } from '../../config/redis.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
    private readonly redisService: RedisService,
  ) {}

  async create(user: User, dto: CreateEventDto): Promise<Event> {
    // Règle Freemium : max 3 événements actifs simultanés pour les comptes gratuits
    if (!user.est_premium) {
      const activeCount = await this.eventRepository.count({
        where: {
          id_organisateur: user.id_utilisateur,
          statut: StatutEvenement.ACTIF,
        },
      });

      if (activeCount >= 3) {
        throw new ForbiddenException(
          'Limite de 3 événements actifs simultanés atteinte pour le compte gratuit. Passez à Tempize Premium pour créer des événements en illimité.',
        );
      }
    }

    let tags: Tag[] = [];
    if (dto.tag_ids && dto.tag_ids.length > 0) {
      tags = await this.tagRepository.findBy({ id_tag: In(dto.tag_ids) });
    }

    const event = this.eventRepository.create({
      id_organisateur: user.id_utilisateur,
      titre: dto.titre,
      description: dto.description,
      date_debut: new Date(dto.date_debut),
      date_fin: new Date(dto.date_fin),
      adresse: dto.adresse,
      latitude: dto.latitude,
      longitude: dto.longitude,
      nb_places_max: dto.nb_places_max,
      type_acces: dto.type_acces || TypeAcces.PUBLIC,
      statut: StatutEvenement.ACTIF,
      location: {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      },
      tags,
    });

    const savedEvent = await this.eventRepository.save(event);

    // Invalider le cache des feeds locaux dans Redis
    try {
      await this.redisService.del(`feed:*`);
    } catch (e) {
      this.logger.warn(`Redis del warning: ${e.message}`);
    }

    return savedEvent;
  }

  async getFeed(user: User, query: FeedQueryDto) {
    // Règle Freemium CDC : 15km max pour les comptes gratuits
    let effectiveRadius = query.radius || 15;
    if (!user.est_premium && effectiveRadius > 15) {
      effectiveRadius = 15;
    }
    const radiusMeters = effectiveRadius * 1000;

    const userTagIds = user.tags ? user.tags.map((t) => t.id_tag) : [];

    // Requête spatiale PostGIS
    const qb = this.eventRepository.createQueryBuilder('event');

    qb.leftJoinAndSelect('event.organisateur', 'organisateur')
      .leftJoinAndSelect('event.tags', 'tags')
      .leftJoin('event.participations', 'part', 'part.statut_participation = :accepted', {
        accepted: StatutParticipation.ACCEPTE,
      })
      .addSelect('COUNT(DISTINCT part.id_utilisateur)', 'nb_inscrits')
      .addSelect(
        `ST_Distance(
          event.location,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
        )`,
        'distance_metres',
      )
      .where('event.statut = :status', { status: StatutEvenement.ACTIF })
      .andWhere('event.date_fin > NOW()')
      .andWhere('event.id_organisateur != :userId', { userId: user.id_utilisateur })
      .andWhere(
        `ST_DWithin(
          event.location,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
          :radius
        )`,
        {
          lon: query.longitude,
          lat: query.latitude,
          radius: radiusMeters,
        },
      )
      // Exclure les événements déjà swipés non réapparus
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM swipe s
          WHERE s.id_evenement = event.id_evenement
            AND s.id_utilisateur = :userId
            AND (s.date_reapparition IS NULL OR s.date_reapparition > NOW())
        )`,
        { userId: user.id_utilisateur },
      )
      .groupBy('event.id_evenement')
      .addGroupBy('organisateur.id_utilisateur')
      .addGroupBy('tags.id_tag')
      .having('(COUNT(DISTINCT part.id_utilisateur) < event.nb_places_max OR :isPremium = true)', {
        isPremium: user.est_premium,
      })
      .orderBy('distance_metres', 'ASC')
      .limit(20);

    const rawAndEntities = await qb.getRawAndEntities();

    // Associer les calculs bruts aux entités
    return rawAndEntities.entities.map((entity, index) => {
      const raw = rawAndEntities.raw[index];
      const distanceM = parseFloat(raw.distance_metres) || 0;
      const nbInscrits = parseInt(raw.nb_inscrits, 10) || 0;
      const placesRestantes = Math.max(0, entity.nb_places_max - nbInscrits);

      let distanceStr = `${(distanceM / 1000).toFixed(1)} km`;
      if (distanceM < 1000) {
        distanceStr = `${Math.round(distanceM)} m`;
      }

      // Nombre de tags en commun avec l'utilisateur
      const matchingTagsCount = entity.tags
        ? entity.tags.filter((t) => userTagIds.includes(t.id_tag)).length
        : 0;

      return {
        ...entity,
        distance: distanceStr,
        distance_metres: Math.round(distanceM),
        nb_inscrits: nbInscrits,
        places_restantes: placesRestantes,
        matching_tags_count: matchingTagsCount,
      };
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id_evenement: id },
      relations: ['organisateur', 'tags', 'annonces'],
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    return event;
  }

  async getUserEvents(userId: number) {
    const organized = await this.eventRepository.find({
      where: { id_organisateur: userId },
      relations: ['tags', 'participations', 'annonces'],
      order: { date_debut: 'ASC' },
    });

    const participations = await this.participationRepository.find({
      where: { id_utilisateur: userId },
      relations: ['evenement', 'evenement.organisateur', 'evenement.tags'],
      order: { date_demande: 'DESC' },
    });

    return {
      organises: organized,
      participations: participations.map((p) => ({
        statut: p.statut_participation,
        date_demande: p.date_demande,
        est_prioritaire: p.est_prioritaire,
        evenement: p.evenement,
      })),
    };
  }
}
