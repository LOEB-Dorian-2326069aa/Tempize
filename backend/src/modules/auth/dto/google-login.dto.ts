import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Jeton ID obtenu auprès de Google' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  idToken: string;
}
