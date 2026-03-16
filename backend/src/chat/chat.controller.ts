import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatPhaseService } from './chat-phase.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatPhaseService: ChatPhaseService,
  ) {}

  @Get('conversations')
  async getConversations(@CurrentUser() user: User) {
    const conversations = await this.chatService.getConversations(user.id);
    return { data: conversations };
  }

  @Get('presets')
  async getPresets(@Query('category') category?: string) {
    const presets = await this.chatService.getPresets(category);
    return { data: presets };
  }

  @Get(':missionId/messages')
  async getMessages(@Param('missionId', ParseUUIDPipe) missionId: string) {
    const messages = await this.chatService.getMessages(missionId);
    return { data: messages };
  }

  @Get(':missionId/phase')
  async getMissionChatInfo(
    @Param('missionId', ParseUUIDPipe) missionId: string,
    @CurrentUser() user: User,
  ) {
    const mission = await this.chatService.getMissionById(missionId);
    if (!mission) throw new NotFoundException('Mission introuvable');

    const phase = this.chatPhaseService.getChatPhase(mission);
    let remaining: number | null = null;

    if (phase === 'pre_acceptance') {
      remaining = await this.chatPhaseService.getRemainingMessages(mission.id, user.id);
    }

    return { data: { phase, remaining, missionId } };
  }

  @Get(':missionId/interests')
  async getMissionInterests(
    @Param('missionId', ParseUUIDPipe) missionId: string,
    @CurrentUser() _user: User,
  ) {
    const interests = await this.chatService.getInterestedVendeurs(missionId);
    return {
      data: interests.map((i) => ({
        vendeurId: i.vendeurId,
        firstName: i.vendeur?.firstName,
        lastName: i.vendeur ? i.vendeur.lastName[0] + '.' : '',
        avatarUrl: i.vendeur?.avatarUrl,
        createdAt: i.createdAt,
      })),
    };
  }
}
