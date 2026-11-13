import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateEventReviewDto {
  @ApiProperty({ example: 1, description: 'Identifiant de l’événement noté' })
  @IsInt()
  @IsNotEmpty()
  id_evenement: number;

  @ApiProperty({ example: 5, description: 'Note attribuée à l’événement (de 1 à 5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  note_evenement: number;

  @ApiPropertyOptional({
    example: 'Super ambiance, groupe très sympa et jeux bien choisis !',
    description: 'Commentaire textuel facultatif',
  })
  @IsOptional()
  @IsString()
  commentaire?: string;
}
