import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateOrganizerReviewDto {
  @ApiProperty({ example: 1, description: 'Identifiant de l’organisateur noté' })
  @IsInt()
  @IsNotEmpty()
  id_organisateur: number;

  @ApiProperty({ example: 5, description: 'Note attribuée à l’organisateur (de 1 à 5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  note_organisateur: number;

  @ApiPropertyOptional({
    example: 'Organisateur au top, ponctuel et très accueillant !',
    description: 'Commentaire textuel facultatif',
  })
  @IsOptional()
  @IsString()
  commentaire?: string;
}
