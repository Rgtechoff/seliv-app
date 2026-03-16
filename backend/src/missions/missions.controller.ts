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
import { serializeAddress } from './serializers/address.serializer';
import { Mission } from './entities/mission.entity';
import { PromoCodesService } from '../promo-codes/promo-codes.service';

type ViewerContext = { id: string; role: string } | null;

function applyAddressToMission(mission: Mission, viewer: ViewerContext) {
  const addrResp = serializeAddress(mission, viewer);
  return {
    ...mission,
    address_display: addrResp.address_display,
    address_street: addrResp.address_street,
    address_city: addrResp.address_city,
    address_postal_code: addrResp.address_postal_code,
    address_masked: addrResp.address_masked,
  };
}

@Controller('missions')
@UseGuards(JwtAuthGuard)
export class MissionsController {
  constructor(
    private readonly missionsService: MissionsService,
    private readonly promoCodesService: PromoCodesService,
  ) {}

  @Post('validate-promo')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT)
  async validatePromo(
    @Body() body: { code: string; priceBeforePromo: number },
  ) {
    const result = await this.promoCodesService.validate(body.code, body.priceBeforePromo);
    return { data: result };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT)
  async create(@CurrentUser() user: User, @Body() dto: CreateMissionDto) {
    // TODO: get actual plan from SubscriptionsService
    const plan = SubscriptionPlan.BASIC;
    const mission = await this.missionsService.create(user.id, dto, plan);
    return { data: applyAddressToMission(mission, { id: user.id, role: user.role }) };
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.VENDEUR)
  async getMyMissions(@CurrentUser() user: User) {
    const viewer: ViewerContext = { id: user.id, role: user.role };
    const missions =
      user.role === UserRole.VENDEUR
        ? await this.missionsService.findByVendeurId(user.id)
        : await this.missionsService.findByClientId(user.id);
    return { data: missions.map((m) => applyAddressToMission(m, viewer)) };
  }

  @Get('available')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDEUR)
  async getAvailable(@CurrentUser() user: User) {
    const missions = await this.missionsService.findAvailableForVendeur(
      user.zones,
      user.categories,
    );
    const viewer: ViewerContext = { id: user.id, role: user.role };
    // Never expose client contact info to vendeur
    return {
      data: missions.map((m) => {
        const addrResp = serializeAddress(m, viewer);
        return {
          id: m.id,
          date: m.date,
          startTime: m.startTime,
          durationHours: m.durationHours,
          city: m.city,
          category: m.category,
          volume: m.volume,
          totalPrice: m.totalPrice,
          status: m.status,
          address_display: addrResp.address_display,
          address_street: addrResp.address_street,
          address_city: addrResp.address_city,
          address_postal_code: addrResp.address_postal_code,
          address_masked: addrResp.address_masked,
        };
      }),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const mission = await this.missionsService.findById(id);
    if (!mission) return { data: null };

    const viewer: ViewerContext = { id: user.id, role: user.role };
    const addrResp = serializeAddress(mission, viewer);

    // If vendeur: never expose client contact
    if (user.role === UserRole.VENDEUR) {
      return {
        data: {
          id: mission.id,
          date: mission.date,
          startTime: mission.startTime,
          durationHours: mission.durationHours,
          city: mission.city,
          category: mission.category,
          volume: mission.volume,
          status: mission.status,
          totalPrice: mission.totalPrice,
          vendeurId: mission.vendeurId,
          basePrice: mission.basePrice,
          optionsPrice: mission.optionsPrice,
          discount: mission.discount,
          address_display: addrResp.address_display,
          address_street: addrResp.address_street,
          address_city: addrResp.address_city,
          address_postal_code: addrResp.address_postal_code,
          address_masked: addrResp.address_masked,
        },
      };
    }

    return { data: applyAddressToMission(mission, viewer) };
  }

  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDEUR)
  async acceptMission(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const mission = await this.missionsService.assignVendeur(id, user.id);
    return { data: applyAddressToMission(mission, { id: user.id, role: user.role }) };
  }

  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDEUR)
  async completeMission(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const mission = await this.missionsService.markCompleted(id, user.id);
    return { data: applyAddressToMission(mission, { id: user.id, role: user.role }) };
  }
}
