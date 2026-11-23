import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvisEvenement } from './entities/avis-evenement.entity';
import { AvisOrganisateur } from './entities/avis-organisateur.entity';
import { Event } from '../events/entities/event.entity';
import { Participation } from '../participations/entities/participation.entity';
import { User } from '../users/entities/user.entity';
import { CreateEventReviewDto } from './dto/create-event-review.dto';
import { CreateOrganizerReviewDto } from './dto/create-organizer-review.dto';
import { StatutParticipation } from '../../common/enums';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(AvisEvenement)
    private readonly avisEvenementRepository: Repository<AvisEvenement>,
    @InjectRepository(AvisOrganisateur)
    private readonly avisOrganisateurRepository: Repository<AvisOrganisateur>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async reviewEvent(userId: number, dto: CreateEventReviewDto) {
    const event = await this.eventRepository.findOne({
      where: { id_evenement: dto.id_evenement },
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    if (event.id_organisateur === userId) {
      throw new BadRequestException('Vous ne pouvez pas évaluer votre propre événement');
    }

    // Vérifier que l'utilisateur a bien participé à l'événement
    const participation = await this.participationRepository.findOne({
      where: {
        id_evenement: dto.id_evenement,
        id_utilisateur: userId,
        statut_participation: StatutParticipation.ACCEPTE,
      },
    });

    if (!participation) {
      throw new ForbiddenException(
        'Vous devez avoir participé à cet événement pour pouvoir l’évaluer',
      );
    }

    let review = await this.avisEvenementRepository.findOne({
      where: { id_utilisateur: userId, id_evenement: dto.id_evenement },
    });

    if (!review) {
      review = this.avisEvenementRepository.create({
        id_utilisateur: userId,
        id_evenement: dto.id_evenement,
        note_evenement: dto.note_evenement,
        commentaire: dto.commentaire,
      });
    } else {
      review.note_evenement = dto.note_evenement;
      review.commentaire = dto.commentaire;
      review.date_avis = new Date();
    }

    return this.avisEvenementRepository.save(review);
  }

  async reviewOrganizer(userId: number, dto: CreateOrganizerReviewDto) {
    if (userId === dto.id_organisateur) {
      throw new BadRequestException('Vous ne pouvez pas vous évaluer vous-même');
    }

    const organizer = await this.userRepository.findOne({
      where: { id_utilisateur: dto.id_organisateur },
    });

    if (!organizer) {
      throw new NotFoundException('Organisateur introuvable');
    }

    let review = await this.avisOrganisateurRepository.findOne({
      where: { id_auteur: userId, id_organisateur: dto.id_organisateur },
    });

    if (!review) {
      review = this.avisOrganisateurRepository.create({
        id_auteur: userId,
        id_organisateur: dto.id_organisateur,
        note_organisateur: dto.note_organisateur,
        commentaire: dto.commentaire,
      });
    } else {
      review.note_organisateur = dto.note_organisateur;
      review.commentaire = dto.commentaire;
      review.date_avis = new Date();
    }

    return this.avisOrganisateurRepository.save(review);
  }

  async getOrganizerStats(organizerId: number) {
    const reviews = await this.avisOrganisateurRepository.find({
      where: { id_organisateur: organizerId },
      relations: ['auteur'],
      order: { date_avis: 'DESC' },
    });

    const count = reviews.length;
    const average =
      count > 0
        ? Number(
            (
              reviews.reduce((acc, r) => acc + r.note_organisateur, 0) / count
            ).toFixed(1),
          )
        : 0;

    return {
      organisateur_id: organizerId,
      note_moyenne: average,
      total_avis: count,
      avis: reviews.map((r) => ({
        note: r.note_organisateur,
        commentaire: r.commentaire,
        date: r.date_avis,
        auteur_nom: r.auteur ? (r.auteur.nom || r.auteur.pseudo) : 'Anonyme',
        auteur_pseudo: r.auteur ? (r.auteur.nom || r.auteur.pseudo) : 'Anonyme',
      })),
    };
  }
}
