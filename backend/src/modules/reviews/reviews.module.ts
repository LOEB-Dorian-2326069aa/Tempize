import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvisEvenement } from './entities/avis-evenement.entity';
import { AvisOrganisateur } from './entities/avis-organisateur.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AvisEvenement, AvisOrganisateur])],
  exports: [TypeOrmModule],
})
export class ReviewsModule {}
