import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':missionId/messages')
  async getMessages(@Param('missionId', ParseUUIDPipe) missionId: string) {
    const messages = await this.chatService.getMessages(missionId);
    return { data: messages };
  }

  @Get('presets')
  async getPresets(@Query('category') category?: string) {
    const presets = await this.chatService.getPresets(category);
    return { data: presets };
  }
}
