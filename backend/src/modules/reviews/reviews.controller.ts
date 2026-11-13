import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateEventReviewDto } from './dto/create-event-review.dto';
import { CreateOrganizerReviewDto } from './dto/create-organizer-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('event')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Évaluer un événement effectué (1 à 5 étoiles + commentaire à J+1)' })
  @ApiResponse({ status: 201, description: 'Avis enregistré' })
  @ApiResponse({ status: 403, description: 'Non participant' })
  async reviewEvent(
    @CurrentUser() user: User,
    @Body() dto: CreateEventReviewDto,
  ) {
    return this.reviewsService.reviewEvent(user.id_utilisateur, dto);
  }

  @Post('organizer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Évaluer un organisateur (1 à 5 étoiles)' })
  @ApiResponse({ status: 201, description: 'Avis sur l’organisateur enregistré' })
  async reviewOrganizer(
    @CurrentUser() user: User,
    @Body() dto: CreateOrganizerReviewDto,
  ) {
    return this.reviewsService.reviewOrganizer(user.id_utilisateur, dto);
  }

  @Get('organizer/:organizerId')
  @ApiOperation({ summary: 'Consulter la réputation et note moyenne d’un organisateur' })
  @ApiResponse({ status: 200, description: 'Statistiques et liste des avis' })
  async getOrganizerStats(
    @Param('organizerId', ParseIntPipe) organizerId: number,
  ) {
    return this.reviewsService.getOrganizerStats(organizerId);
  }
}
