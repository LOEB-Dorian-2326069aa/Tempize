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
  @ApiProperty({ example: 'lucas_m', description: 'Pseudo unique' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  pseudo: string;

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
