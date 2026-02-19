import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';

interface SendMessagePayload {
  missionId: string;
  content: string;
  isPreset?: boolean;
  senderId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinMission')
  handleJoinMission(
    @ConnectedSocket() client: Socket,
    @MessageBody() missionId: string,
  ): void {
    void client.join(`mission:${missionId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ): Promise<void> {
    const result = await this.chatService.sendMessage(
      payload.missionId,
      payload.senderId,
      payload.content,
      payload.isPreset ?? false,
    );

    if (!result.isFlagged) {
      this.server
        .to(`mission:${payload.missionId}`)
        .emit('receiveMessage', result);
    } else {
      // Notify sender that message was blocked
      client.emit('messageBlocked', {
        message: 'Votre message a été bloqué par la modération.',
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { missionId: string; userId: string },
  ): void {
    client
      .to(`mission:${data.missionId}`)
      .emit('userTyping', { userId: data.userId });
  }
}
