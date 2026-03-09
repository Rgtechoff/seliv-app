import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogInterceptor } from './activity-log.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  controllers: [ActivityLogController],
  providers: [ActivityLogService, ActivityLogInterceptor],
  exports: [ActivityLogService, ActivityLogInterceptor],
})
export class ActivityLogModule {}
