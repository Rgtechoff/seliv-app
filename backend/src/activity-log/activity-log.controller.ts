import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';

@Controller('super-admin/activity-log')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) {}

  @Get()
  findAll(
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      actorId,
      action,
      targetType,
      fromDate,
      toDate,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('export')
  async exportCsv(
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.service.exportCsv({ actorId, action, fromDate, toDate });
    res?.setHeader('Content-Type', 'text/csv');
    res?.setHeader('Content-Disposition', 'attachment; filename=activity-log.csv');
    res?.send(csv);
  }
}
