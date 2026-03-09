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
import { ServicesCatalogService } from './services-catalog.service';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';

@Controller('api/v1')
export class ServicesCatalogController {
  constructor(private readonly service: ServicesCatalogService) {}

  // Authenticated: clients/vendeurs can browse available services
  @Get('services')
  @UseGuards(JwtAuthGuard)
  findActive() {
    return this.service.findAllActive();
  }

  @Get('super-admin/services')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  findAll() {
    return this.service.findAll();
  }

  @Post('super-admin/services')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  create(@Body() dto: CreateServiceItemDto) {
    return this.service.create(dto);
  }

  @Put('super-admin/services/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateServiceItemDto) {
    return this.service.update(id, dto);
  }

  @Delete('super-admin/services/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  softDelete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  @Patch('super-admin/services/reorder')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  reorder(@Body() body: { ids: string[] }) {
    return this.service.reorder(body.ids);
  }
}
