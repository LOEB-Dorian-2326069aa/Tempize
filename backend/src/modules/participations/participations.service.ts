import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participation } from './entities/participation.entity';
import { Event } from '../events/entities/event.entity';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { StatutParticipation } from '../../common/enums';

@Injectable()
export class ParticipationsService {
  private readonly logger = new Logger(ParticipationsService.name);

  constructor(
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async getEventParticipations(organizerId: number, eventId: number) {
    const event = await this.eventRepository.findOne({
      where: { id_evenement: eventId },
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    if (event.id_organisateur !== organizerId) {
      throw new ForbiddenException('Seul l’organisateur peut consulter les demandes de participation');
    }

    return this.participationRepository.find({
      where: { id_evenement: eventId },
      relations: ['utilisateur', 'utilisateur.tags'],
      order: {
        est_prioritaire: 'DESC',
        date_demande: 'ASC',
      },
    });
  }

  async updateStatus(
    organizerId: number,
    eventId: number,
    participantId: number,
    dto: UpdateParticipationDto,
  ) {
    const event = await this.eventRepository.findOne({
      where: { id_evenement: eventId },
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    if (event.id_organisateur !== organizerId) {
      throw new ForbiddenException('Seul l’organisateur peut valider ou refuser les participants');
    }

    const participation = await this.participationRepository.findOne({
      where: { id_evenement: eventId, id_utilisateur: participantId },
    });

    if (!participation) {
      throw new NotFoundException('Demande de participation introuvable');
    }

    // Vérifier la jauge de places si validation
    if (dto.statut === StatutParticipation.ACCEPTE) {
      const currentAccepted = await this.participationRepository.count({
        where: {
          id_evenement: eventId,
          statut_participation: StatutParticipation.ACCEPTE,
        },
      });

      if (currentAccepted >= event.nb_places_max) {
        throw new BadRequestException('Le nombre maximum de participants est déjà atteint pour cet événement');
      }
    }

    participation.statut_participation = dto.statut;
    participation.date_reponse = new Date();

    const updated = await this.participationRepository.save(participation);

    return {
      message: dto.statut === StatutParticipation.ACCEPTE ? 'Participant accepté' : 'Participant refusé',
      participation: updated,
    };
  }

  async cancelParticipation(userId: number, eventId: number) {
    const participation = await this.participationRepository.findOne({
      where: { id_evenement: eventId, id_utilisateur: userId },
    });

    if (!participation) {
      throw new NotFoundException('Aucune participation trouvée pour cet événement');
    }

    const wasAccepted = participation.statut_participation === StatutParticipation.ACCEPTE;
    await this.participationRepository.remove(participation);

    // Si le participant était accepté, gestion automatisée de la liste d'attente (CDC)
    // Promotion automatique du premier sur liste d'attente (priorité Premium d'abord, puis FIFO)
    let promotedUser: Participation | null = null;
    if (wasAccepted) {
      const nextInLine = await this.participationRepository.findOne({
        where: {
          id_evenement: eventId,
          statut_participation: StatutParticipation.LISTE_ATTENTE,
        },
        order: {
          est_prioritaire: 'DESC', // Pass-droit Premium en tête
          date_demande: 'ASC',     // FIFO ensuite
        },
      });

      if (nextInLine) {
        nextInLine.statut_participation = StatutParticipation.ACCEPTE;
        nextInLine.date_reponse = new Date();
        promotedUser = await this.participationRepository.save(nextInLine);
        this.logger.log(
          `Utilisateur ${nextInLine.id_utilisateur} promu automatiquement depuis la liste d’attente pour l'événement ${eventId} (Prioritaire: ${nextInLine.est_prioritaire})`,
        );
      }
    }

    return {
      message: 'Désistement enregistré avec succès',
      promoted_from_waitlist: promotedUser ? promotedUser.id_utilisateur : null,
    };
  }
}
