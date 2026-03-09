import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    const dbOk = this.dataSource.isInitialized;
    return {
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbOk ? 'ok' : 'error',
      },
    };
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('detailed')
  async detailed() {
    const dbOk = this.dataSource.isInitialized;
    const mem = process.memoryUsage();
    const uptimeSec = Math.floor(process.uptime());

    return {
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: uptimeSec,
      services: {
        database: dbOk ? 'ok' : 'error',
      },
      memory: {
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        rssMb: Math.round(mem.rss / 1024 / 1024),
      },
      node: {
        version: process.version,
        env: process.env['NODE_ENV'] ?? 'development',
      },
    };
  }
}
