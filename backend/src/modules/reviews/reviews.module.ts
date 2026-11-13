import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvisEvenement } from './entities/avis-evenement.entity';
import { AvisOrganisateur } from './entities/avis-organisateur.entity';
import { Event } from '../events/entities/event.entity';
import { Participation } from '../participations/entities/participation.entity';
import { User } from '../users/entities/user.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AvisEvenement,
      AvisOrganisateur,
      Event,
      Participation,
      User,
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService, TypeOrmModule],
})
export class ReviewsModule {}
