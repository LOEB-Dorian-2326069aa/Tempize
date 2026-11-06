import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { TypeAcces } from '../../../common/enums';

export class CreateEventDto {
  @ApiProperty({ example: 'Soirée Jeux de Société & Cocktails 🎲', description: 'Titre de l’événement' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  titre: string;

  @ApiProperty({ example: 'Venez découvrir de nouveaux jeux dans un bar sympa au cœur de Lyon !', description: 'Description complète' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2026-11-06T19:30:00Z', description: 'Date et heure de début' })
  @IsDateString()
  date_debut: string;

  @ApiProperty({ example: '2026-11-06T23:30:00Z', description: 'Date et heure de fin' })
  @IsDateString()
  date_fin: string;

  @ApiProperty({ example: '12 Rue Mercière, 69002 Lyon', description: 'Adresse postale complète' })
  @IsString()
  @IsNotEmpty()
  adresse: string;

  @ApiProperty({ example: 45.764043, description: 'Latitude GPS' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 4.835659, description: 'Longitude GPS' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 8, description: 'Nombre maximum de participants' })
  @IsNumber()
  @Min(2)
  @Max(1000)
  nb_places_max: number;

  @ApiPropertyOptional({ enum: TypeAcces, default: TypeAcces.PUBLIC, description: 'Type d’accès : public ou sur validation' })
  @IsOptional()
  @IsEnum(TypeAcces)
  type_acces?: TypeAcces;

  @ApiPropertyOptional({ example: [1, 2], description: 'Identifiants des tags associés' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tag_ids?: number[];
}
