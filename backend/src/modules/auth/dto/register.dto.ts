import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Lucas', description: 'Prénom de l’utilisateur' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  prenom: string;

  @ApiPropertyOptional({ example: 'Martin', description: 'Nom de famille (optionnel)' })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional({ example: 'lucas_m', description: 'Pseudo ou surnom (optionnel)' })
  @IsOptional()
  @IsString()
  pseudo?: string;

  @ApiProperty({ example: 'lucas@example.com', description: 'Adresse email unique' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SuperSecret123!', description: 'Mot de passe (min 6 caractères)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  mot_de_passe: string;

  @ApiPropertyOptional({ example: '1998-05-14', description: 'Date de naissance (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date_naissance?: string;

  @ApiPropertyOptional({ example: 'Passionné de jeux de plateau et sorties plein air', description: 'Biographie' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'Identifiants des tags / centres d’intérêt' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tag_ids?: number[];

  @ApiPropertyOptional({ example: 45.764043, description: 'Latitude GPS actuelle' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 4.835659, description: 'Longitude GPS actuelle' })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
