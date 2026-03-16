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
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatPhaseService } from './chat-phase.service';
import { ModerationService } from './moderation/moderation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

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

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatPhaseService: ChatPhaseService,
    private readonly moderationService: ModerationService,
    private readonly notificationsService: NotificationsService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinMission')
  async handleJoinMission(
    @ConnectedSocket() client: Socket,
    @MessageBody() missionId: string,
  ): Promise<void> {
    await client.join(`mission:${missionId}`);

    // If the sender is a vendeur interested in this mission, register interest
    const senderId = client.handshake.auth?.userId as string | undefined;
    if (senderId) {
      const mission = await this.chatService.getMissionById(missionId);
      if (mission && mission.clientId !== senderId && mission.status === 'paid') {
        await this.chatService.registerInterest(missionId, senderId);
      }
    }
  }

  @SubscribeMessage('leaveMission')
  handleLeaveMission(
    @ConnectedSocket() client: Socket,
    @MessageBody() missionId: string,
  ): void {
    void client.leave(`mission:${missionId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ): Promise<void> {
    const { missionId, content, isPreset = false, senderId } = payload;

    if (!missionId || !content || !senderId) {
      client.emit('error', { message: 'Payload invalide.' });
      return;
    }

    // 1. Récupérer la mission
    const mission = await this.chatService.getMissionById(missionId);
    if (!mission) {
      client.emit('error', { message: 'Mission introuvable.' });
      return;
    }

    // 2. Vérifier que le sender peut chatter sur cette mission
    const isClient = senderId === mission.clientId;
    const isAssignedVendeur = senderId === mission.vendeurId;
    const isBrowsingVendeur = !isClient && !isAssignedVendeur && (mission.status as string) === 'paid';
    const isMissionAssignedToAnother =
      mission.vendeurId && mission.vendeurId !== senderId && (mission.status as string) === 'assigned';

    if (!isClient && !isAssignedVendeur && !isBrowsingVendeur) {
      client.emit('error', { message: 'Accès non autorisé à ce chat.' });
      return;
    }

    if (isMissionAssignedToAnother) {
      client.emit('error', { message: 'Cette mission a déjà été attribuée à un autre vendeur.' });
      return;
    }

    // 3. Déterminer la phase
    const phase = this.chatPhaseService.getChatPhase(mission);

    // 4. Vérifier la limite (pré-acceptation seulement, et uniquement pour les messages non-preset)
    if (!isPreset) {
      const { allowed, reason, remaining } = await this.chatPhaseService.canSendMessage(mission, senderId);
      if (!allowed) {
        client.emit('message_limit_reached', {
          missionId,
          reason,
          remaining: 0,
        });
        return;
      }
    }

    // 5. Modération
    const modResult = await this.moderationService.analyze(content, senderId, missionId, phase);

    if (modResult.action === 'block') {
      client.emit('message_blocked', {
        missionId,
        reason: 'Ce message ne peut pas être envoyé. Les coordonnées personnelles ne sont pas autorisées.',
      });
      return;
    }

    // 6. Sauvegarder le message
    const savedMessage = await this.chatService.createMessage({
      missionId,
      senderId,
      content,
      isPreset,
      chatPhase: phase,
      moderationAction: modResult.action,
      moderationScore: modResult.score,
    });

    // 7. Calculer remaining après envoi
    let remaining: number | null = null;
    if (phase === 'pre_acceptance' && !isPreset) {
      remaining = await this.chatPhaseService.getRemainingMessages(missionId, senderId);
    }

    // 8. Diffuser le message
    const messagePayload = {
      ...savedMessage,
      remaining_messages: remaining,
      chat_phase: phase,
    };

    this.server.to(`mission:${missionId}`).emit('receiveMessage', messagePayload);

    // 9. Notifier l'autre participant
    const recipientId = isClient ? mission.vendeurId : mission.clientId;
    if (recipientId) {
      const preview = content.length > 80 ? content.substring(0, 80) + '…' : content;
      await this.notificationsService.create({
        userId: recipientId,
        type: NotificationType.NEW_CHAT_MESSAGE,
        title: 'Nouveau message',
        body: preview,
        missionId,
      });
      this.server.emit(`newChatNotification:${recipientId}`, { missionId });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { missionId: string; userId: string },
  ): void {
    client.to(`mission:${data.missionId}`).emit('userTyping', { userId: data.userId });
  }

  // Appelé quand une mission passe de 'paid' à 'assigned'
  async onMissionAccepted(missionId: string, vendeurFirstName: string): Promise<void> {
    // Message système dans le chat
    const systemMsg = await this.chatService.createSystemMessage(
      missionId,
      `${vendeurFirstName} a accepté la mission. Le chat est maintenant illimité.`,
    );

    this.server.to(`mission:${missionId}`).emit('receiveMessage', {
      ...systemMsg,
      chat_phase: 'post_acceptance',
      remaining_messages: null,
    });

    // Émettre un event de transition de phase
    this.server.to(`mission:${missionId}`).emit('phaseChanged', {
      missionId,
      newPhase: 'post_acceptance',
    });
  }
}
