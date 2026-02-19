import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';
import { ConfigService } from '@nestjs/config';

class CreateSubscriptionDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('my')
  async getMy(@CurrentUser() user: User) {
    const sub = await this.subscriptionsService.findActiveByUserId(user.id);
    return { data: sub };
  }

  @Post('checkout')
  async createCheckout(
    @CurrentUser() user: User,
    @Body() dto: CreateSubscriptionDto,
  ) {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const result = await this.subscriptionsService.createCheckoutSession(
      user.id,
      dto.plan,
      frontendUrl,
    );
    return { data: result };
  }
}
