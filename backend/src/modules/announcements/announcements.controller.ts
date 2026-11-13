import { Controller, Post, Get, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publier une annonce sur le canal unilatéral (Organisateur)' })
  @ApiResponse({ status: 201, description: 'Annonce publiée' })
  @ApiResponse({ status: 403, description: 'Non autorisé (non organisateur)' })
  async create(@CurrentUser() user: User, @Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(user.id_utilisateur, dto);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consulter le fil d’annonces d’un événement' })
  @ApiResponse({ status: 200, description: 'Liste des annonces de l’événement' })
  async findByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.announcementsService.findByEvent(eventId);
  }
}
