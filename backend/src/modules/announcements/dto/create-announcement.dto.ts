import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 1, description: 'Identifiant de l’événement concerné' })
  @IsNumber()
  @IsNotEmpty()
  id_evenement: number;

  @ApiProperty({
    example: 'Le point de rendez-vous exact est devant l’entrée principale du bar à 19h45 !',
    description: 'Message d’annonce diffusé aux participants',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(1000)
  contenu: string;
}
