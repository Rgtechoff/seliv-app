import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuperAdminAnalyticsService } from './super-admin-analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';

@Controller('api/v1/super-admin/analytics')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminAnalyticsController {
  constructor(private readonly service: SuperAdminAnalyticsService) {}

  @Get()
  getDashboard() {
    return this.service.getDashboard();
  }

  @Get('revenue-chart')
  getRevenueChart() {
    return this.service.getRevenueChart();
  }

  @Get('missions-chart')
  getMissionsChart() {
    return this.service.getMissionsChart();
  }
}
