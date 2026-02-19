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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const missions_service_1 = require("../missions/missions.service");
const mission_status_enum_1 = require("../common/enums/mission-status.enum");
const mission_entity_1 = require("../missions/entities/mission.entity");
const PDFDocument = require('pdfkit');
let PaymentsService = class PaymentsService {
    constructor(configService, missionsService, missionRepo) {
        this.configService = configService;
        this.missionsService = missionsService;
        this.missionRepo = missionRepo;
        this.stripe = new stripe_1.default(this.configService.getOrThrow('STRIPE_SECRET_KEY'), { apiVersion: '2026-01-28.clover' });
    }
    async createCheckoutSession(missionId, totalPriceCentimes, clientEmail, frontendUrl) {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Mission SELIV #${missionId.slice(0, 8)}`,
                        },
                        unit_amount: totalPriceCentimes,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            customer_email: clientEmail,
            success_url: `${frontendUrl}/client/missions/${missionId}?payment=success`,
            cancel_url: `${frontendUrl}/client/missions/new?payment=cancelled`,
            metadata: { missionId },
        });
        if (!session.url) {
            throw new common_1.BadRequestException('Failed to create checkout session');
        }
        await this.missionsService.updateStripeData(missionId, {
            stripeCheckoutSessionId: session.id,
            status: mission_status_enum_1.MissionStatus.PENDING_PAYMENT,
        });
        return { url: session.url };
    }
    async handleWebhook(rawBody, signature) {
        const webhookSecret = this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET');
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const missionId = session.metadata?.['missionId'];
            if (missionId) {
                await this.missionsService.updateStripeData(missionId, {
                    stripePaymentId: session.payment_intent,
                    paidAt: new Date(),
                    status: mission_status_enum_1.MissionStatus.PAID,
                });
            }
        }
    }
    async refund(paymentIntentId, amountCentimes) {
        return this.stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amountCentimes,
        });
    }
    async generateInvoicePdf(missionId) {
        const mission = await this.missionRepo.findOne({
            where: { id: missionId },
            relations: ['client'],
        });
        if (!mission) {
            throw new common_1.NotFoundException(`Mission ${missionId} introuvable`);
        }
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const emissionDate = new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const missionDate = mission.date instanceof Date
                ? mission.date.toLocaleDateString('fr-FR')
                : String(mission.date);
            const formatPrice = (centimes) => (centimes / 100).toFixed(2) + ' €';
            doc.fontSize(24).font('Helvetica-Bold').text('SELIV — Facture', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text(`Date d'émission : ${emissionDate}`, { align: 'center' });
            doc.moveDown(1.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
            doc.moveDown(1);
            doc.fontSize(13).font('Helvetica-Bold').text('Informations de la mission');
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica');
            doc.text(`Référence mission : ${mission.id}`);
            doc.text(`Date du live       : ${missionDate}`);
            doc.text(`Heure de début     : ${mission.startTime}`);
            doc.text(`Durée              : ${mission.durationHours}h`);
            doc.text(`Ville              : ${mission.city}`);
            doc.text(`Catégorie          : ${mission.category}`);
            doc.text(`Volume             : ${mission.volume}`);
            doc.moveDown(1.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
            doc.moveDown(1);
            doc.fontSize(13).font('Helvetica-Bold').text('Détail des prix');
            doc.moveDown(0.5);
            const tableLeft = 50;
            const tableRight = 545;
            const col2 = 400;
            const rowHeight = 20;
            const drawRow = (label, value, bold = false, bgColor) => {
                const y = doc.y;
                if (bgColor) {
                    doc
                        .rect(tableLeft, y, tableRight - tableLeft, rowHeight)
                        .fill(bgColor)
                        .fillColor('black');
                }
                const font = bold ? 'Helvetica-Bold' : 'Helvetica';
                doc.fontSize(11).font(font);
                doc.text(label, tableLeft + 5, y + 4, {
                    width: col2 - tableLeft - 10,
                    lineBreak: false,
                });
                doc.text(value, col2, y + 4, {
                    width: tableRight - col2 - 5,
                    align: 'right',
                    lineBreak: false,
                });
                doc.y = y + rowHeight;
            };
            drawRow('Prix de base', formatPrice(mission.basePrice));
            drawRow('Options', formatPrice(mission.optionsPrice));
            drawRow('Réduction abonnement', `- ${formatPrice(mission.discount)}`);
            doc.moveTo(tableLeft, doc.y).lineTo(tableRight, doc.y).strokeColor('#cccccc').stroke();
            doc.moveDown(0.3);
            drawRow('TOTAL', formatPrice(mission.totalPrice), true, '#f0f0f0');
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
            doc.moveDown(0.5);
            doc
                .fontSize(9)
                .font('Helvetica')
                .fillColor('#888888')
                .text('SELIV SAS — contact@seliv.fr', { align: 'center' });
            doc.end();
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        missions_service_1.MissionsService,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map