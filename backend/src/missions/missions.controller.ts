import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';

@Controller('missions')
@UseGuards(JwtAuthGuard)
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT)
  async create(@CurrentUser() user: User, @Body() dto: CreateMissionDto) {
    // TODO: get actual plan from SubscriptionsService
    const plan = SubscriptionPlan.BASIC;
    const mission = await this.missionsService.create(user.id, dto, plan);
    return { data: mission };
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.VENDEUR)
  async getMyMissions(@CurrentUser() user: User) {
    const missions =
      user.role === UserRole.VENDEUR
        ? await this.missionsService.findByVendeurId(user.id)
        : await this.missionsService.findByClientId(user.id);
    return { data: missions };
  }

  @Get('available')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDEUR)
  async getAvailable(@CurrentUser() user: User) {
    const missions = await this.missionsService.findAvailableForVendeur(
      user.zones,
      user.categories,
    );
    // Never expose client contact info to vendeur
    return {
      data: missions.map((m) => ({
        id: m.id,
        date: m.date,
        startTime: m.startTime,
        durationHours: m.durationHours,
        city: m.city,
        category: m.category,
        volume: m.volume,
        totalPrice: m.totalPrice,
        status: m.status,
      })),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const mission = await this.missionsService.findById(id);
    if (!mission) return { data: null };

    // If vendeur: never expose client contact
    if (user.role === UserRole.VENDEUR) {
      return {
        data: {
          id: mission.id,
          date: mission.date,
          startTime: mission.startTime,
          durationHours: mission.durationHours,
          address: mission.address,
          city: mission.city,
          category: mission.category,
          volume: mission.volume,
          status: mission.status,
          totalPrice: mission.totalPrice,
        },
      };
    }

    return { data: mission };
  }

  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDEUR)
  async acceptMission(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const mission = await this.missionsService.assignVendeur(id, user.id);
    return { data: mission };
  }

  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDEUR)
  async completeMission(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const mission = await this.missionsService.markCompleted(id, user.id);
    return { data: mission };
  }
}
