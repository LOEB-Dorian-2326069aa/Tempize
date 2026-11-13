import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { Event } from '../events/entities/event.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(organizerId: number, dto: CreateAnnouncementDto): Promise<Announcement> {
    const event = await this.eventRepository.findOne({
      where: { id_evenement: dto.id_evenement },
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    if (event.id_organisateur !== organizerId) {
      throw new ForbiddenException(
        'Seul l’organisateur de l’événement peut publier sur le canal d’annonces',
      );
    }

    const announcement = this.announcementRepository.create({
      id_evenement: dto.id_evenement,
      id_organisateur: organizerId,
      contenu: dto.contenu,
    });

    return this.announcementRepository.save(announcement);
  }

  async findByEvent(eventId: number): Promise<Announcement[]> {
    const event = await this.eventRepository.findOne({
      where: { id_evenement: eventId },
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    return this.announcementRepository.find({
      where: { id_evenement: eventId },
      order: { date_publication: 'DESC' },
    });
  }
}
