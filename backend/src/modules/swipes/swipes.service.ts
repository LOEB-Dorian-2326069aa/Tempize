import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Swipe } from './entities/swipe.entity';
import { Event } from '../events/entities/event.entity';
import { Participation } from '../participations/entities/participation.entity';
import { User } from '../users/entities/user.entity';
import { CreateSwipeDto } from './dto/create-swipe.dto';
import { DirectionSwipe, StatutParticipation, TypeAcces, StatutEvenement } from '../../common/enums';

@Injectable()
export class SwipesService {
  private readonly logger = new Logger(SwipesService.name);

  constructor(
    @InjectRepository(Swipe)
    private readonly swipeRepository: Repository<Swipe>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
  ) {}

  async swipe(user: User, dto: CreateSwipeDto) {
    const event = await this.eventRepository.findOne({
      where: { id_evenement: dto.id_evenement },
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    if (event.statut !== StatutEvenement.ACTIF) {
      throw new BadRequestException('Cet événement n’est plus actif');
    }

    if (event.id_organisateur === user.id_utilisateur) {
      throw new BadRequestException('Vous ne pouvez pas swiper sur votre propre événement');
    }

    // Gestion du Swipe GAUCHE (Refuser / Masquer)
    if (dto.direction === DirectionSwipe.GAUCHE) {
      const cooldownDate = new Date();
      cooldownDate.setDate(cooldownDate.getDate() + 7); // Réapparition après 7 jours

      let swipe = await this.swipeRepository.findOne({
        where: { id_utilisateur: user.id_utilisateur, id_evenement: dto.id_evenement },
      });

      if (!swipe) {
        swipe = this.swipeRepository.create({
          id_utilisateur: user.id_utilisateur,
          id_evenement: dto.id_evenement,
          direction: DirectionSwipe.GAUCHE,
          date_reapparition: cooldownDate,
        });
      } else {
        swipe.direction = DirectionSwipe.GAUCHE;
        swipe.date_reapparition = cooldownDate;
      }

      await this.swipeRepository.save(swipe);

      return {
        action: 'pass',
        id_evenement: dto.id_evenement,
        message: 'Événement ignoré (masqué pendant 7 jours)',
      };
    }

    // Gestion du Swipe DROITE (Participer)
    let swipe = await this.swipeRepository.findOne({
      where: { id_utilisateur: user.id_utilisateur, id_evenement: dto.id_evenement },
    });

    if (!swipe) {
      swipe = this.swipeRepository.create({
        id_utilisateur: user.id_utilisateur,
        id_evenement: dto.id_evenement,
        direction: DirectionSwipe.DROITE,
        date_reapparition: null,
      });
    } else {
      swipe.direction = DirectionSwipe.DROITE;
      swipe.date_reapparition = null;
    }
    await this.swipeRepository.save(swipe);

    // Calcul des places restantes
    const acceptedCount = await this.participationRepository.count({
      where: {
        id_evenement: dto.id_evenement,
        statut_participation: StatutParticipation.ACCEPTE,
      },
    });

    let targetStatus: StatutParticipation;

    if (event.type_acces === TypeAcces.PUBLIC) {
      if (acceptedCount < event.nb_places_max) {
        targetStatus = StatutParticipation.ACCEPTE;
      } else {
        // Liste d'attente automatique avec pass-droit Premium si l'événement est complet
        targetStatus = StatutParticipation.LISTE_ATTENTE;
      }
    } else {
      // Mode sur validation : demande soumise à l'organisateur
      targetStatus = StatutParticipation.EN_ATTENTE;
    }

    let participation = await this.participationRepository.findOne({
      where: { id_utilisateur: user.id_utilisateur, id_evenement: dto.id_evenement },
    });

    if (!participation) {
      participation = this.participationRepository.create({
        id_utilisateur: user.id_utilisateur,
        id_evenement: dto.id_evenement,
        statut_participation: targetStatus,
        est_prioritaire: user.est_premium,
      });
    } else {
      participation.statut_participation = targetStatus;
      participation.est_prioritaire = user.est_premium;
      participation.date_demande = new Date();
    }

    await this.participationRepository.save(participation);

    return {
      action: 'like',
      id_evenement: dto.id_evenement,
      statut_participation: targetStatus,
      est_prioritaire: user.est_premium,
      message:
        targetStatus === StatutParticipation.ACCEPTE
          ? 'Inscription confirmée !'
          : targetStatus === StatutParticipation.LISTE_ATTENTE
            ? 'Événement complet : vous êtes sur la liste d’attente'
            : 'Demande envoyée à l’organisateur (en attente de validation)',
    };
  }

  async rewind(user: User) {
    // Règle Freemium CDC : Bouton Rewind réservé aux membres Premium
    if (!user.est_premium) {
      throw new ForbiddenException(
        'Le bouton Rewind pour annuler un swipe est une fonctionnalité réservée aux membres Tempize Premium.',
      );
    }

    const lastSwipe = await this.swipeRepository.findOne({
      where: { id_utilisateur: user.id_utilisateur },
      order: { date_swipe: 'DESC' },
    });

    if (!lastSwipe) {
      throw new NotFoundException('Aucun swipe récent à annuler.');
    }

    // Supprimer le swipe
    await this.swipeRepository.remove(lastSwipe);

    // Supprimer la participation si c'était un like
    await this.participationRepository.delete({
      id_utilisateur: user.id_utilisateur,
      id_evenement: lastSwipe.id_evenement,
    });

    return {
      message: 'Dernier swipe annulé avec succès',
      id_evenement: lastSwipe.id_evenement,
    };
  }
}
