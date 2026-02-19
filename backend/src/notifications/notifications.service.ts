import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Resend } from 'resend';
import {
  Notification,
  NotificationType,
} from './entities/notification.entity';
import { Mission } from '../missions/entities/mission.entity';
import { MissionStatus } from '../common/enums/mission-status.enum';

@Injectable()
export class NotificationsService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(Mission)
    private readonly missionRepo: Repository<Mission>,
    private configService: ConfigService,
  ) {
    this.resend = new Resend(
      this.configService.get<string>('RESEND_API_KEY', 're_placeholder'),
    );
    this.fromEmail = this.configService.get<string>(
      'RESEND_FROM_EMAIL',
      'noreply@seliv.fr',
    );
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    missionId?: string;
    sendEmail?: boolean;
    userEmail?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepo.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      missionId: data.missionId ?? null,
    });

    const saved = await this.notificationRepo.save(notification);

    if (data.sendEmail && data.userEmail) {
      await this.sendEmail(data.userEmail, data.title, data.body);
      await this.notificationRepo.update(saved.id, { isEmailSent: true });
    }

    return saved;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepo.update(
      { id: notificationId, userId },
      { isRead: true },
    );
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationRepo.update({ userId }, { isRead: true });
  }

  async notifyMissionCreated(
    clientId: string,
    clientEmail: string,
    missionId: string,
  ): Promise<void> {
    await this.create({
      userId: clientId,
      type: NotificationType.MISSION_CREATED,
      title: 'Mission créée avec succès',
      body: 'Votre mission a été créée et le paiement confirmé. Un vendeur va être assigné.',
      missionId,
      sendEmail: true,
      userEmail: clientEmail,
    });
  }

  async notifyVendeurAssigned(
    clientId: string,
    clientEmail: string,
    missionId: string,
    vendeurName: string,
  ): Promise<void> {
    await this.create({
      userId: clientId,
      type: NotificationType.VENDEUR_ASSIGNED,
      title: 'Vendeur assigné à votre mission',
      body: `${vendeurName} a été assigné(e) à votre mission.`,
      missionId,
      sendEmail: true,
      userEmail: clientEmail,
    });
  }

  async notifyMissionCompleted(
    clientId: string,
    clientEmail: string,
    missionId: string,
  ): Promise<void> {
    await this.create({
      userId: clientId,
      type: NotificationType.MISSION_COMPLETED,
      title: 'Mission terminée — Laissez un avis',
      body: 'Votre live est terminé ! Pensez à laisser un avis pour votre vendeur.',
      missionId,
      sendEmail: true,
      userEmail: clientEmail,
    });
  }

  async notifyFlaggedMessage(
    adminId: string,
    missionId: string,
  ): Promise<void> {
    await this.create({
      userId: adminId,
      type: NotificationType.CHAT_MESSAGE_FLAGGED,
      title: 'Message flaggé détecté',
      body: 'Un message potentiellement problématique a été détecté dans une conversation.',
      missionId,
    });
  }

  async notifyNewMissionAvailable(
    vendeurId: string,
    vendeurEmail: string,
    missionId: string,
    city: string,
  ): Promise<void> {
    await this.create({
      userId: vendeurId,
      type: NotificationType.NEW_MISSION_AVAILABLE,
      title: 'Nouvelle mission disponible',
      body: `Une nouvelle mission est disponible à ${city}. Consultez-la dès maintenant !`,
      missionId,
      sendEmail: true,
      userEmail: vendeurEmail,
    });
  }

  @Cron('0 10 * * *')
  async sendMissionDayBeforeReminders(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const missions = await this.missionRepo.find({
      where: {
        status: In([MissionStatus.PAID, MissionStatus.ASSIGNED]),
        date: new Date(dateStr) as unknown as Date,
      },
      relations: ['client', 'vendeur'],
    });

    this.logger.log(
      `[Rappel J-1] ${missions.length} mission(s) trouvée(s) pour le ${dateStr}`,
    );

    for (const mission of missions) {
      const title = 'Rappel : votre mission est demain';
      const body = `Votre mission du ${dateStr} est prévue demain. Préparez-vous !`;

      // Notification au client
      if (mission.client) {
        await this.create({
          userId: mission.clientId,
          type: NotificationType.MISSION_REMINDER,
          title,
          body,
          missionId: mission.id,
          sendEmail: true,
          userEmail: mission.client.email,
        });
      }

      // Notification au vendeur (si assigné)
      if (mission.vendeurId && mission.vendeur) {
        const vendeurBody = `Rappel : vous avez une mission assignée demain le ${dateStr}.`;
        await this.create({
          userId: mission.vendeurId,
          type: NotificationType.MISSION_REMINDER,
          title,
          body: vendeurBody,
          missionId: mission.id,
          sendEmail: true,
          userEmail: mission.vendeur.email,
        });
      }
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<void> {
    if (!this.configService.get<string>('RESEND_API_KEY')) return;
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html: `<p>${body}</p><br/><small>SELIV — The Live Selling Network</small>`,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}
