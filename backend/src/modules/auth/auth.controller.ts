import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription d’un nouvel utilisateur avec ses centres d’intérêt' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé et token JWT retourné' })
  @ApiResponse({ status: 409, description: 'Email ou pseudo déjà existant' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur par email et mot de passe' })
  @ApiResponse({ status: 200, description: 'Connexion réussie et token JWT retourné' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil complet de l’utilisateur actuellement connecté' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur avec centres d’intérêt' })
  @ApiResponse({ status: 401, description: 'Token invalide ou manquant' })
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id_utilisateur);
  }
}
