import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SuperAdminVendeursService } from './super-admin-vendeurs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { VendorLevel } from '../../common/enums/vendor-level.enum';

@Controller('api/v1/super-admin/vendeurs')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminVendeursController {
  constructor(private readonly service: SuperAdminVendeursService) {}

  @Get()
  findAll(
    @Query('level') level?: VendorLevel,
    @Query('suspended') suspended?: string,
  ) {
    return this.service.findAll({
      level,
      isSuspended: suspended !== undefined ? suspended === 'true' : undefined,
    });
  }

  @Get('performance')
  getPerformance() {
    return this.service.getPerformanceRanking();
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.service.findHistory(id);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.service.suspend(id, reason);
  }

  @Post(':id/unsuspend')
  unsuspend(@Param('id') id: string) {
    return this.service.unsuspend(id);
  }

  @Post(':id/toggle-star')
  toggleStar(@Param('id') id: string) {
    return this.service.toggleStar(id);
  }

  @Put(':id/level')
  updateLevel(@Param('id') id: string, @Body('level') level: VendorLevel) {
    return this.service.updateLevel(id, level);
  }

  @Put(':id/commission')
  updateCommission(@Param('id') id: string, @Body('commissionRate') commissionRate: number) {
    return this.service.updateCommission(id, commissionRate);
  }
}
