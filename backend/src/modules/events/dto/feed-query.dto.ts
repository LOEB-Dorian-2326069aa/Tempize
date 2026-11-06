import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class FeedQueryDto {
  @ApiProperty({ example: 45.764043, description: 'Latitude de l’utilisateur' })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 4.835659, description: 'Longitude de l’utilisateur' })
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 15, default: 15, description: 'Rayon de recherche en kilomètres (max 15km pour compte gratuit)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  radius?: number = 15;
}
