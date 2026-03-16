import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatPreset } from './entities/chat-preset.entity';
import { Mission } from '../missions/entities/mission.entity';
import { MissionInterest } from './entities/mission-interest.entity';

// Modération patterns: bloque numéros FR, emails, réseaux sociaux
const BLOCKED_PATTERNS = [
  /0[67]\d{8}/, // 06/07xxxxxxxx
  /\+33\s*[67]\s*\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/, // +33 6/7
  /\d{10}/, // tout nombre 10 chiffres
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // email
  /whatsapp/i,
  /telegram/i,
  /signal\s*(app)?/i,
  /instagram\.com/i,
  /facebook\.com/i,
  /tiktok\.com/i,
  /snapchat/i,
  /discord/i,
];

function isFlagged(content: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(content));
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
    @InjectRepository(ChatPreset)
    private readonly presetRepo: Repository<ChatPreset>,
    @InjectRepository(Mission)
    private readonly missionRepo: Repository<Mission>,
    @InjectRepository(MissionInterest)
    private readonly interestRepo: Repository<MissionInterest>,
  ) {}

  async sendMessage(
    missionId: string,
    senderId: string,
    content: string,
    isPreset: boolean,
  ): Promise<ChatMessage> {
    const flagged = !isPreset && isFlagged(content);

    const message = this.messageRepo.create({
      missionId,
      senderId,
      content,
      isPreset,
      isFlagged: flagged,
    });

    return this.messageRepo.save(message);
  }

  async getMessages(missionId: string): Promise<ChatMessage[]> {
    return this.messageRepo.find({
      where: { missionId, isFlagged: false },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async getFlaggedMessages(): Promise<ChatMessage[]> {
    return this.messageRepo.find({
      where: { isFlagged: true },
      relations: ['sender', 'mission'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPresets(category?: string): Promise<ChatPreset[]> {
    if (category) {
      return this.presetRepo.find({
        where: { category },
        order: { sortOrder: 'ASC' },
      });
    }
    return this.presetRepo.find({ order: { category: 'ASC', sortOrder: 'ASC' } });
  }

  async approveMessage(messageId: string): Promise<ChatMessage> {
    await this.messageRepo.update(messageId, { isFlagged: false });
    const msg = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!msg) throw new Error(`Message ${messageId} not found`);
    return msg;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.messageRepo.delete(messageId);
  }

  async getMission(missionId: string): Promise<Mission | null> {
    return this.missionRepo.findOne({ where: { id: missionId } });
  }

  async getMissionById(missionId: string): Promise<Mission | null> {
    return this.missionRepo.findOne({ where: { id: missionId } });
  }

  async registerInterest(missionId: string, vendeurId: string): Promise<void> {
    const exists = await this.interestRepo.findOne({ where: { missionId, vendeurId } });
    if (!exists) {
      await this.interestRepo.save(this.interestRepo.create({ missionId, vendeurId }));
    }
  }

  async getInterestedVendeurs(missionId: string): Promise<MissionInterest[]> {
    return this.interestRepo.find({
      where: { missionId },
      relations: ['vendeur'],
    });
  }

  async createSystemMessage(missionId: string, content: string): Promise<ChatMessage> {
    const msg = this.messageRepo.create({
      missionId,
      senderId: missionId, // pseudo sender = missionId pour les system messages
      content,
      isPreset: false,
      isFlagged: false,
      isSystem: true,
      chatPhase: 'post_acceptance',
      moderationAction: 'allow',
      moderationScore: 0,
    });
    return this.messageRepo.save(msg);
  }

  async createMessage(data: {
    missionId: string;
    senderId: string;
    content: string;
    isPreset: boolean;
    chatPhase: 'pre_acceptance' | 'post_acceptance';
    moderationAction: string;
    moderationScore: number;
  }): Promise<ChatMessage> {
    const isFlaggedMsg = data.moderationAction === 'flag';
    const isBlocked = data.moderationAction === 'block';

    if (isBlocked) {
      // Ne pas sauvegarder les messages bloqués (uniquement loggés dans moderation_logs)
      // Retourner un objet temporaire sans sauvegarde
      return {
        id: 'blocked',
        missionId: data.missionId,
        senderId: data.senderId,
        content: data.content,
        isPreset: data.isPreset,
        isFlagged: true,
        isSystem: false,
        chatPhase: data.chatPhase,
        moderationAction: 'block',
        moderationScore: data.moderationScore,
        createdAt: new Date(),
      } as unknown as ChatMessage;
    }

    const message = this.messageRepo.create({
      missionId: data.missionId,
      senderId: data.senderId,
      content: data.content,
      isPreset: data.isPreset,
      isFlagged: isFlaggedMsg,
      isSystem: false,
      chatPhase: data.chatPhase,
      moderationAction: data.moderationAction,
      moderationScore: data.moderationScore,
    });
    return this.messageRepo.save(message);
  }

  async getConversations(userId: string) {
    const missions = await this.missionRepo.find({
      where: [{ clientId: userId }, { vendeurId: userId }],
      relations: ['client', 'vendeur'],
      order: { updatedAt: 'DESC' },
    });

    const results = await Promise.all(
      missions.map(async (mission) => {
        const lastMessage = await this.messageRepo.findOne({
          where: { missionId: mission.id, isFlagged: false },
          order: { createdAt: 'DESC' },
        });

        const otherParticipant =
          mission.clientId === userId ? mission.vendeur : mission.client;

        return {
          missionId: mission.id,
          category: mission.category,
          date: mission.date,
          status: mission.status,
          city: mission.city,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
                isPreset: lastMessage.isPreset,
              }
            : null,
          otherParticipant: otherParticipant
            ? {
                id: otherParticipant.id,
                firstName: otherParticipant.firstName,
                lastName: otherParticipant.lastName,
                avatarUrl: otherParticipant.avatarUrl,
              }
            : null,
        };
      }),
    );

    // Sort by last message date (most recent first), then by mission date
    return results.sort((a, b) => {
      const aDate = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bDate = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bDate - aDate;
    });
  }

  async seedPresets(): Promise<void> {
    const existing = await this.presetRepo.count();
    if (existing > 0) return;

    const presets = [
      // Logistique
      { category: 'Logistique', label: 'Les articles sont prêts et étiquetés', sortOrder: 1 },
      { category: 'Logistique', label: "J'ai besoin de plus de temps pour la préparation", sortOrder: 2 },
      { category: 'Logistique', label: 'Le volume est différent de ce qui était prévu', sortOrder: 3 },
      { category: 'Logistique', label: 'Où puis-je me garer ?', sortOrder: 4 },
      // Horaire
      { category: 'Horaire', label: 'Je serai en retard de 15 minutes', sortOrder: 1 },
      { category: 'Horaire', label: 'Je suis en route', sortOrder: 2 },
      { category: 'Horaire', label: "Je suis arrivé(e)", sortOrder: 3 },
      { category: 'Horaire', label: 'Peut-on décaler de 30 minutes ?', sortOrder: 4 },
      // Live
      { category: 'Live', label: 'Le live est lancé', sortOrder: 1 },
      { category: 'Live', label: 'Problème technique en cours', sortOrder: 2 },
      { category: 'Live', label: 'Le live est terminé', sortOrder: 3 },
      { category: 'Live', label: 'Les résultats du live sont disponibles', sortOrder: 4 },
    ];

    for (const p of presets) {
      await this.presetRepo.save(this.presetRepo.create(p));
    }
  }
}
