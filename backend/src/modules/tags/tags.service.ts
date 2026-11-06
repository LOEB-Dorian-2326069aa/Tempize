import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

const INITIAL_TAGS = [
  'Sport',
  'Jeux de société',
  'Musique',
  'Bar',
  'Randonnée',
  'Soirée',
  'Plein air',
  'Culture',
  'Cuisine',
  'Jeux vidéo',
  'Cinéma',
  'Voyage',
];

@Injectable()
export class TagsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TagsService.name);

  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async onApplicationBootstrap() {
    try {
      const count = await this.tagRepository.count();
      if (count === 0) {
        this.logger.log('Initialisation des tags par défaut...');
        for (const libelle of INITIAL_TAGS) {
          await this.tagRepository.save({ libelle });
        }
        this.logger.log(`✓ ${INITIAL_TAGS.length} tags initiaux créés avec succès.`);
      }
    } catch (error) {
      this.logger.warn(`Initialisation des tags différée : ${error.message}`);
    }
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({ order: { libelle: 'ASC' } });
  }
}
