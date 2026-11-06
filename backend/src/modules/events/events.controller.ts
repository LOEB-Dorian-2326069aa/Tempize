import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouvel événement (Public ou Sur validation)' })
  @ApiResponse({ status: 201, description: 'Événement créé avec succès' })
  @ApiResponse({ status: 403, description: 'Limite de 3 événements atteinte pour compte gratuit' })
  async create(@CurrentUser() user: User, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user, dto);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Flux de cartes à swiper triées par proximité PostGIS et centres d’intérêt' })
  @ApiResponse({ status: 200, description: 'Liste des événements recommandés avec distance et places' })
  async getFeed(@CurrentUser() user: User, @Query() query: FeedQueryDto) {
    return this.eventsService.getFeed(user, query);
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liste de mes sorties (organisées et rejointes)' })
  @ApiResponse({ status: 200, description: 'Événements organisés et participations' })
  async getMyEvents(@CurrentUser() user: User) {
    return this.eventsService.getUserEvents(user.id_utilisateur);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consulter la fiche détaillée d’un événement' })
  @ApiResponse({ status: 200, description: 'Détails de l’événement' })
  @ApiResponse({ status: 404, description: 'Événement introuvable' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }
}
