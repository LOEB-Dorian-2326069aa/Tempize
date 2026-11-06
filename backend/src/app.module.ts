import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/database.config';
import { RedisModule } from './config/redis.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { TagsModule } from './modules/tags/tags.module';
import { EventsModule } from './modules/events/events.module';
import { SwipesModule } from './modules/swipes/swipes.module';
import { ParticipationsModule } from './modules/participations/participations.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    RedisModule,
    HealthModule,
    UsersModule,
    TagsModule,
    EventsModule,
    SwipesModule,
    ParticipationsModule,
    AnnouncementsModule,
    ReviewsModule,
  ],
})
export class AppModule {}
