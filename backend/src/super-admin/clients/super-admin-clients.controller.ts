import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { SuperAdminClientsService } from './super-admin-clients.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';

@Controller('api/v1/super-admin/clients')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminClientsController {
  constructor(private readonly service: SuperAdminClientsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('segments')
  getSegments() {
    return this.service.getSegments();
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.service.findHistory(id);
  }

  @Put(':id/notes')
  updateNotes(@Param('id') id: string, @Body('notes') notes: string) {
    return this.service.updateNotes(id, notes);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.service.suspend(id, reason);
  }

  @Post(':id/unsuspend')
  unsuspend(@Param('id') id: string) {
    return this.service.unsuspend(id);
  }
}
