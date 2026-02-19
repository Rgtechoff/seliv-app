import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatPreset } from './entities/chat-preset.entity';

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
