import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Headers,
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { MissionsService } from '../missions/missions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { IsString } from 'class-validator';

class CancelMissionDto {
  @IsString()
  reason: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly missionsService: MissionsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('missions/:id/checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  async createCheckout(
    @Param('id', ParseUUIDPipe) missionId: string,
    @CurrentUser() user: User,
  ) {
    const mission = await this.missionsService.findById(missionId);
    if (!mission) throw new NotFoundException('Mission not found');
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const result = await this.paymentsService.createCheckoutSession(
      missionId,
      mission.totalPrice,
      user.email,
      frontendUrl,
    );
    return { data: result };
  }

  @Post('missions/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  async cancelMission(
    @Param('id', ParseUUIDPipe) missionId: string,
    @CurrentUser() user: User,
    @Body() dto: CancelMissionDto,
  ) {
    const { mission, refundPercent } = await this.missionsService.cancel(
      missionId,
      user.id,
      dto.reason,
    );

    if (mission.stripePaymentId && mission.totalPrice) {
      const refundAmount = Math.floor(
        (mission.totalPrice * refundPercent) / 100,
      );
      const refund = await this.paymentsService.refund(
        mission.stripePaymentId,
        refundAmount,
      );
      return { data: { mission, refund, refundPercent } };
    }

    return { data: { mission, refundPercent } };
  }

  @Get('missions/:missionId/invoice')
  @UseGuards(JwtAuthGuard)
  async downloadInvoice(
    @Param('missionId', ParseUUIDPipe) missionId: string,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.paymentsService.generateInvoicePdf(missionId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${missionId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) throw new NotFoundException('Raw body not available');
    await this.paymentsService.handleWebhook(rawBody, signature);
    return { received: true };
  }
}
