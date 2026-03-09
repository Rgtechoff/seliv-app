import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ReorderPlansDto } from './dto/reorder-plans.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';

@Controller('api/v1')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  // Public endpoint — returns active plans for pricing page
  @Get('plans')
  findActive() {
    return this.plansService.findAllActive();
  }

  @Get('super-admin/plans')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  findAll() {
    return this.plansService.findAllWithSubscriberCount();
  }

  @Post('super-admin/plans')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Put('super-admin/plans/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete('super-admin/plans/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  softDelete(@Param('id') id: string) {
    return this.plansService.softDelete(id);
  }

  @Patch('super-admin/plans/reorder')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  reorder(@Body() dto: ReorderPlansDto) {
    return this.plansService.reorder(dto.ids);
  }
}
