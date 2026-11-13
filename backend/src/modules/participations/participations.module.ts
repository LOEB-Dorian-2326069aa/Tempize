import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participation } from './entities/participation.entity';
import { Event } from '../events/entities/event.entity';
import { ParticipationsService } from './participations.service';
import { ParticipationsController } from './participations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Participation, Event])],
  controllers: [ParticipationsController],
  providers: [ParticipationsService],
  exports: [ParticipationsService, TypeOrmModule],
})
export class ParticipationsModule {}
