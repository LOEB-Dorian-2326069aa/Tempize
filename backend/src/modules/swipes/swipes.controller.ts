import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SwipesService } from './swipes.service';
import { CreateSwipeDto } from './dto/create-swipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Swipes')
@Controller('swipes')
export class SwipesController {
  constructor(private readonly swipesService: SwipesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enregistrer une action de swipe (droite = participer, gauche = passer)' })
  @ApiResponse({ status: 201, description: 'Swipe enregistré et participation mise à jour' })
  @ApiResponse({ status: 400, description: 'Action invalide ou swipe sur son propre événement' })
  async swipe(@CurrentUser() user: User, @Body() dto: CreateSwipeDto) {
    return this.swipesService.swipe(user, dto);
  }

  @Post('rewind')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Annuler le dernier swipe (Fonctionnalité Premium)' })
  @ApiResponse({ status: 200, description: 'Dernier swipe annulé avec succès' })
  @ApiResponse({ status: 403, description: 'Fonctionnalité réservée aux abonnés Premium' })
  @ApiResponse({ status: 404, description: 'Aucun swipe récent à annuler' })
  async rewind(@CurrentUser() user: User) {
    return this.swipesService.rewind(user);
  }
}
