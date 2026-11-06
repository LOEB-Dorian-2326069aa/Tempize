import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { Client } from 'pg';
import { entities } from '../database/entities';

const logger = new Logger('DatabaseConfig');

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    const host = configService.get<string>('POSTGRES_HOST', 'localhost');
    const port = configService.get<number>('POSTGRES_PORT', 5433);
    const user = configService.get<string>('POSTGRES_USER', 'tempize');
    const password = configService.get<string>('POSTGRES_PASSWORD', 'tempize_secret');
    const database = configService.get<string>('POSTGRES_DB', 'tempize_db');
    const ssl = configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false;
    const synchronize = configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true';

    // S'assurer que l'extension PostGIS est activée avant que TypeORM ne synchronise les tables
    try {
      const client = new Client({
        host,
        port,
        user,
        password,
        database,
        ssl,
      });
      await client.connect();
      await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
      await client.end();
      logger.log('✓ Extension PostGIS vérifiée/activée avec succès.');
    } catch (e) {
      logger.warn(`Vérification préalable PostGIS : ${e.message}`);
    }

    return {
      type: 'postgres',
      host,
      port,
      username: user,
      password,
      database,
      ssl,
      entities,
      synchronize,
      logging: configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
    };
  },
};
