import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Swipe } from './entities/swipe.entity';
import { Event } from '../events/entities/event.entity';
import { Participation } from '../participations/entities/participation.entity';
import { SwipesService } from './swipes.service';
import { SwipesController } from './swipes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Swipe, Event, Participation])],
  controllers: [SwipesController],
  providers: [SwipesService],
  exports: [SwipesService, TypeOrmModule],
})
export class SwipesModule {}
