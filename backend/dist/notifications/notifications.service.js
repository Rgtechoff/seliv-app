"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const resend_1 = require("resend");
const notification_entity_1 = require("./entities/notification.entity");
const mission_entity_1 = require("../missions/entities/mission.entity");
const mission_status_enum_1 = require("../common/enums/mission-status.enum");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(notificationRepo, missionRepo, configService) {
        this.notificationRepo = notificationRepo;
        this.missionRepo = missionRepo;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.resend = new resend_1.Resend(this.configService.get('RESEND_API_KEY', 're_placeholder'));
        this.fromEmail = this.configService.get('RESEND_FROM_EMAIL', 'noreply@seliv.fr');
    }
    async create(data) {
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
    async findByUserId(userId) {
        return this.notificationRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
    async markRead(notificationId, userId) {
        await this.notificationRepo.update({ id: notificationId, userId }, { isRead: true });
    }
    async markAllRead(userId) {
        await this.notificationRepo.update({ userId }, { isRead: true });
    }
    async notifyMissionCreated(clientId, clientEmail, missionId) {
        await this.create({
            userId: clientId,
            type: notification_entity_1.NotificationType.MISSION_CREATED,
            title: 'Mission créée avec succès',
            body: 'Votre mission a été créée et le paiement confirmé. Un vendeur va être assigné.',
            missionId,
            sendEmail: true,
            userEmail: clientEmail,
        });
    }
    async notifyVendeurAssigned(clientId, clientEmail, missionId, vendeurName) {
        await this.create({
            userId: clientId,
            type: notification_entity_1.NotificationType.VENDEUR_ASSIGNED,
            title: 'Vendeur assigné à votre mission',
            body: `${vendeurName} a été assigné(e) à votre mission.`,
            missionId,
            sendEmail: true,
            userEmail: clientEmail,
        });
    }
    async notifyMissionCompleted(clientId, clientEmail, missionId) {
        await this.create({
            userId: clientId,
            type: notification_entity_1.NotificationType.MISSION_COMPLETED,
            title: 'Mission terminée — Laissez un avis',
            body: 'Votre live est terminé ! Pensez à laisser un avis pour votre vendeur.',
            missionId,
            sendEmail: true,
            userEmail: clientEmail,
        });
    }
    async notifyFlaggedMessage(adminId, missionId) {
        await this.create({
            userId: adminId,
            type: notification_entity_1.NotificationType.CHAT_MESSAGE_FLAGGED,
            title: 'Message flaggé détecté',
            body: 'Un message potentiellement problématique a été détecté dans une conversation.',
            missionId,
        });
    }
    async notifyNewMissionAvailable(vendeurId, vendeurEmail, missionId, city) {
        await this.create({
            userId: vendeurId,
            type: notification_entity_1.NotificationType.NEW_MISSION_AVAILABLE,
            title: 'Nouvelle mission disponible',
            body: `Une nouvelle mission est disponible à ${city}. Consultez-la dès maintenant !`,
            missionId,
            sendEmail: true,
            userEmail: vendeurEmail,
        });
    }
    async sendMissionDayBeforeReminders() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        const missions = await this.missionRepo.find({
            where: {
                status: (0, typeorm_2.In)([mission_status_enum_1.MissionStatus.PAID, mission_status_enum_1.MissionStatus.ASSIGNED]),
                date: new Date(dateStr),
            },
            relations: ['client', 'vendeur'],
        });
        this.logger.log(`[Rappel J-1] ${missions.length} mission(s) trouvée(s) pour le ${dateStr}`);
        for (const mission of missions) {
            const title = 'Rappel : votre mission est demain';
            const body = `Votre mission du ${dateStr} est prévue demain. Préparez-vous !`;
            if (mission.client) {
                await this.create({
                    userId: mission.clientId,
                    type: notification_entity_1.NotificationType.MISSION_REMINDER,
                    title,
                    body,
                    missionId: mission.id,
                    sendEmail: true,
                    userEmail: mission.client.email,
                });
            }
            if (mission.vendeurId && mission.vendeur) {
                const vendeurBody = `Rappel : vous avez une mission assignée demain le ${dateStr}.`;
                await this.create({
                    userId: mission.vendeurId,
                    type: notification_entity_1.NotificationType.MISSION_REMINDER,
                    title,
                    body: vendeurBody,
                    missionId: mission.id,
                    sendEmail: true,
                    userEmail: mission.vendeur.email,
                });
            }
        }
    }
    async sendEmail(to, subject, body) {
        if (!this.configService.get('RESEND_API_KEY'))
            return;
        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html: `<p>${body}</p><br/><small>SELIV — The Live Selling Network</small>`,
            });
        }
        catch (error) {
            console.error('Failed to send email:', error);
        }
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)('0 10 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "sendMissionDayBeforeReminders", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map