import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participation } from './entities/participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participation])],
  exports: [TypeOrmModule],
})
export class ParticipationsModule {}
