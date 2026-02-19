import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Body,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { MissionsService } from '../missions/missions.service';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MissionStatus } from '../common/enums/mission-status.enum';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

class AdminAssignVendeurDto {
  @IsUUID()
  vendeurId: string;
}

class AdminChangeStatusDto {
  @IsEnum(MissionStatus)
  status: MissionStatus;

  @IsOptional()
  reason?: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly missionsService: MissionsService,
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('missions')
  async getAllMissions() {
    const missions = await this.missionsService.findAll();
    return { data: missions };
  }

  @Get('subscriptions')
  async getAllSubscriptions() {
    const subscriptions = await this.subscriptionsService.findAll();
    return { data: subscriptions };
  }

  @Patch('missions/:id/assign')
  async assignVendeur(
    @Param('id', ParseUUIDPipe) missionId: string,
    @Body() dto: AdminAssignVendeurDto,
  ) {
    const mission = await this.missionsService.assignVendeur(
      missionId,
      dto.vendeurId,
    );
    return { data: mission };
  }

  @Patch('missions/:id/status')
  async changeMissionStatus(
    @Param('id', ParseUUIDPipe) missionId: string,
    @Body() dto: AdminChangeStatusDto,
  ) {
    const mission = await this.missionsService.findById(missionId);
    if (!mission) return { data: null };

    if (dto.status === MissionStatus.IN_PROGRESS) {
      const updated = await this.missionsService.markInProgress(missionId);
      return { data: updated };
    }

    return { data: mission };
  }

  @Get('vendeurs')
  async getAllVendeurs() {
    const vendeurs = await this.usersService.findByRole(UserRole.VENDEUR);
    return {
      data: vendeurs.map(({ passwordHash: _pw, ...u }) => u),
    };
  }

  @Patch('vendeurs/:id/validate')
  async validateVendeur(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.validateVendeur(id);
    const { passwordHash: _pw, ...safeUser } = user;
    return { data: safeUser };
  }

  @Patch('vendeurs/:id/toggle-star')
  async toggleStar(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.toggleStar(id);
    const { passwordHash: _pw, ...safeUser } = user;
    return { data: safeUser };
  }

  @Get('clients')
  async getAllClients() {
    const clients = await this.usersService.findByRole(UserRole.CLIENT);
    return {
      data: clients.map(({ passwordHash: _pw, ...u }) => u),
    };
  }

  @Get('chat/flagged')
  async getFlaggedMessages() {
    const messages = await this.chatService.getFlaggedMessages();
    return { data: messages };
  }

  @Patch('chat/:id/approve')
  async approveMessage(@Param('id', ParseUUIDPipe) id: string) {
    const message = await this.chatService.approveMessage(id);
    return { data: message };
  }

  @Post('chat/:id/delete')
  async deleteMessage(@Param('id', ParseUUIDPipe) id: string) {
    await this.chatService.deleteMessage(id);
    return { data: { success: true } };
  }

  @Get('export/missions')
  async exportMissions(@Res() res: Response) {
    const missions = await this.missionsService.findAll();
    const csv = [
      'id,clientId,vendeurId,status,date,city,category,totalPrice,createdAt',
      ...missions.map(
        (m) =>
          `${m.id},${m.clientId},${m.vendeurId ?? ''},${m.status},${m.date},${m.city},${m.category},${m.totalPrice},${m.createdAt.toISOString()}`,
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="missions.csv"',
    );
    res.send(csv);
  }
}
