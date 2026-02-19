import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AvailabilitiesService } from './availabilities.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';

@Controller('availabilities')
@UseGuards(JwtAuthGuard)
export class AvailabilitiesController {
  constructor(private readonly service: AvailabilitiesService) {}

  @Get()
  async getMine(@CurrentUser() user: User) {
    const list = await this.service.findByUser(user.id);
    return { data: list };
  }

  @Get(':userId/public')
  async getByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    const list = await this.service.findByUser(userId);
    return { data: list };
  }

  @Post()
  async upsert(@CurrentUser() user: User, @Body() dto: UpsertAvailabilityDto) {
    const avail = await this.service.upsert(user.id, dto);
    return { data: avail };
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id, user.id);
    return { data: { success: true } };
  }
}
