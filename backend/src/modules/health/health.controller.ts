import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { RedisService } from '../../config/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check API, PostgreSQL PostGIS and Redis' })
  async check() {
    // Check DB
    const dbStatus = this.dataSource.isInitialized;
    let postgisVersion: string | null = null;
    try {
      const res = await this.dataSource.query('SELECT PostGIS_Version() as version');
      postgisVersion = res[0]?.version || 'ok';
    } catch (e) {
      postgisVersion = `Error: ${e.message}`;
    }

    // Check Redis
    let redisStatus = 'down';
    try {
      const pong = await this.redisService.ping();
      redisStatus = pong === 'PONG' ? 'up' : pong;
    } catch (e) {
      redisStatus = `Error: ${e.message}`;
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          connected: dbStatus,
          postgis: postgisVersion,
        },
        redis: {
          status: redisStatus,
        },
      },
    };
  }
}
