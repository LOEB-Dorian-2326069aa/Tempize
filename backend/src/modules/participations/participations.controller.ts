import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ParticipationsService } from './participations.service';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Participations')
@Controller('participations')
export class ParticipationsController {
  constructor(private readonly participationsService: ParticipationsService) {}

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consulter la liste des participants et demandes pour un événement (Organisateur)' })
  @ApiResponse({ status: 200, description: 'Liste des participants triée avec priorité Premium' })
  @ApiResponse({ status: 403, description: 'Non autorisé (non organisateur)' })
  async getEventParticipations(
    @CurrentUser() user: User,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.participationsService.getEventParticipations(user.id_utilisateur, eventId);
  }

  @Patch('event/:eventId/user/:participantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Valider ou refuser un participant en attente (Organisateur)' })
  @ApiResponse({ status: 200, description: 'Statut du participant mis à jour' })
  @ApiResponse({ status: 400, description: 'Jauge maximale déjà atteinte' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async updateStatus(
    @CurrentUser() user: User,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('participantId', ParseIntPipe) participantId: number,
    @Body() dto: UpdateParticipationDto,
  ) {
    return this.participationsService.updateStatus(
      user.id_utilisateur,
      eventId,
      participantId,
      dto,
    );
  }

  @Delete('event/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Se désister d’un événement (remplit automatiquement la place depuis la file d’attente)' })
  @ApiResponse({ status: 200, description: 'Désistement confirmé' })
  @ApiResponse({ status: 404, description: 'Participation introuvable' })
  async cancelParticipation(
    @CurrentUser() user: User,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.participationsService.cancelParticipation(user.id_utilisateur, eventId);
  }
}
