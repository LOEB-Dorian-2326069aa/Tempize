import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from '../database/entities';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'postgres',
      host: configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: configService.get<number>('POSTGRES_PORT', 5432),
      username: configService.get<string>('POSTGRES_USER', 'tempize'),
      password: configService.get<string>('POSTGRES_PASSWORD', 'tempize_secret'),
      database: configService.get<string>('POSTGRES_DB', 'tempize_db'),
      entities: entities,
      synchronize: configService.get<string>('NODE_ENV') !== 'production',
      logging: configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
    };
  },
};
