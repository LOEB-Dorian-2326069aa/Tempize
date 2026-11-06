import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
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
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingEmail) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const existingPseudo = await this.userRepository.findOne({
      where: { pseudo: dto.pseudo },
    });
    if (existingPseudo) {
      throw new ConflictException('Ce pseudo est déjà pris');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.mot_de_passe, saltRounds);

    let tags: Tag[] = [];
    if (dto.tag_ids && dto.tag_ids.length > 0) {
      tags = await this.tagRepository.findBy({ id_tag: In(dto.tag_ids) });
    }

    const user = this.userRepository.create({
      pseudo: dto.pseudo,
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

    if (!user) {
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
      pseudo: user.pseudo,
      est_premium: user.est_premium,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    const { mot_de_passe, ...sanitized } = user;
    return sanitized;
  }
}
