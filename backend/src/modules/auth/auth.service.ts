import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingEmail) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.mot_de_passe, saltRounds);

    let tags: Tag[] = [];
    if (dto.tag_ids && dto.tag_ids.length > 0) {
      tags = await this.tagRepository.findBy({ id_tag: In(dto.tag_ids) });
    }

    const displayName = (dto.prenom || dto.nom || dto.pseudo || 'Utilisateur').trim();

    const user = this.userRepository.create({
      prenom: displayName,
      nom: dto.nom?.trim() || displayName,
      pseudo: dto.pseudo?.trim() || displayName,
      email: dto.email.toLowerCase(),
      mot_de_passe: hashedPassword,
      bio: dto.bio,
      date_naissance: dto.date_naissance ? new Date(dto.date_naissance) : null,
      latitude: dto.latitude,
      longitude: dto.longitude,
      tags,
    });

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      user.location = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    const savedUser = await this.userRepository.save(user);

    const token = this.generateToken(savedUser);

    return {
      access_token: token,
      user: this.sanitizeUser(savedUser),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.mot_de_passe')
      .leftJoinAndSelect('user.tags', 'tags')
      .where('LOWER(user.email) = LOWER(:email)', { email: dto.email })
      .getOne();

    if (!user || !user.mot_de_passe) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isMatch = await bcrypt.compare(dto.mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const token = this.generateToken(user);

    return {
      access_token: token,
      user: this.sanitizeUser(user),
    };
  }

  async loginWithGoogle(idToken: string) {
    const clientIds = (
      this.configService.get<string>('GOOGLE_CLIENT_IDS') ||
      this.configService.get<string>('GOOGLE_CLIENT_ID') ||
      ''
    )
      .split(',')
      .map((clientId) => clientId.trim())
      .filter(Boolean);

    if (clientIds.length === 0) {
      throw new InternalServerErrorException('La connexion Google n’est pas configurée.');
    }

    const googleClient = new OAuth2Client();
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: clientIds,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Jeton Google invalide ou expiré.');
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new UnauthorizedException('Le compte Google doit avoir une adresse email vérifiée.');
    }

    const email = payload.email.toLowerCase();
    let user = await this.userRepository.findOne({
      where: { email },
      relations: ['tags'],
    });

    if (!user) {
      const fullName = payload.name?.trim() || '';
      const prenom = (payload.given_name?.trim() || fullName.split(/\s+/)[0] || 'Utilisateur')
        .slice(0, 50);
      const localPart = email.split('@')[0];
      const candidate = this.userRepository.create({
        prenom,
        nom: payload.family_name?.trim().slice(0, 100) || null,
        pseudo: localPart.slice(0, 50),
        email,
        mot_de_passe: null,
        photo: payload.picture?.slice(0, 255) || null,
      });

      try {
        user = await this.userRepository.save(candidate);
      } catch (error) {
        if ((error as { code?: string }).code !== '23505') {
          throw error;
        }

        user = await this.userRepository.findOne({
          where: { email },
          relations: ['tags'],
        });
        if (!user) {
          throw error;
        }
      }
    }

    const token = this.generateToken(user);
    return {
      access_token: token,
      user: this.sanitizeUser(user),
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id_utilisateur: userId },
      relations: ['tags'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return this.sanitizeUser(user);
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id_utilisateur,
      email: user.email,
      prenom: user.prenom || user.nom || user.pseudo,
      nom: user.nom || user.prenom || user.pseudo,
      pseudo: user.pseudo || user.prenom || user.nom,
      est_premium: user.est_premium,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    const { mot_de_passe, ...sanitized } = user;
    return sanitized;
  }
}
