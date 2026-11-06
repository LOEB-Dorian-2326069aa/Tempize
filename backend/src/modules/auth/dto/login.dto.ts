import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'lucas@example.com', description: 'Adresse email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SuperSecret123!', description: 'Mot de passe' })
  @IsString()
  @IsNotEmpty()
  mot_de_passe: string;
}
