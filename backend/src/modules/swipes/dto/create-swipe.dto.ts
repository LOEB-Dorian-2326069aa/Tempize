import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { DirectionSwipe } from '../../../common/enums';

export class CreateSwipeDto {
  @ApiProperty({ example: 1, description: 'Identifiant de l’événement swipé' })
  @IsNumber()
  @IsNotEmpty()
  id_evenement: number;

  @ApiProperty({ enum: DirectionSwipe, example: DirectionSwipe.DROITE, description: 'Direction du swipe : droite (participer) ou gauche (passer)' })
  @IsEnum(DirectionSwipe)
  @IsNotEmpty()
  direction: DirectionSwipe;
}
