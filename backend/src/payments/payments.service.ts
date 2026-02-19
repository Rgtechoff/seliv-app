import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionsService } from '../missions/missions.service';
import { MissionStatus } from '../common/enums/mission-status.enum';
import { Mission } from '../missions/entities/mission.entity';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private missionsService: MissionsService,
    @InjectRepository(Mission)
    private missionRepo: Repository<Mission>,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2026-01-28.clover' },
    );
  }

  async createCheckoutSession(
    missionId: string,
    totalPriceCentimes: number,
    clientEmail: string,
    frontendUrl: string,
  ): Promise<{ url: string }> {
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
      throw new BadRequestException('Failed to create checkout session');
    }

    await this.missionsService.updateStripeData(missionId, {
      stripeCheckoutSessionId: session.id,
      status: MissionStatus.PENDING_PAYMENT,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const missionId = session.metadata?.['missionId'];
      if (missionId) {
        await this.missionsService.updateStripeData(missionId, {
          stripePaymentId: session.payment_intent as string,
          paidAt: new Date(),
          status: MissionStatus.PAID,
        });
      }
    }
  }

  async refund(
    paymentIntentId: string,
    amountCentimes: number,
  ): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCentimes,
    });
  }

  async generateInvoicePdf(missionId: string): Promise<Buffer> {
    const mission = await this.missionRepo.findOne({
      where: { id: missionId },
      relations: ['client'],
    });

    if (!mission) {
      throw new NotFoundException(`Mission ${missionId} introuvable`);
    }

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const emissionDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const missionDate =
        mission.date instanceof Date
          ? mission.date.toLocaleDateString('fr-FR')
          : String(mission.date);

      const formatPrice = (centimes: number): string =>
        (centimes / 100).toFixed(2) + ' €';

      // En-tête
      doc.fontSize(24).font('Helvetica-Bold').text('SELIV — Facture', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`Date d'émission : ${emissionDate}`, { align: 'center' });
      doc.moveDown(1.5);

      // Séparateur
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(1);

      // Informations mission
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

      // Séparateur
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(1);

      // Tableau des prix
      doc.fontSize(13).font('Helvetica-Bold').text('Détail des prix');
      doc.moveDown(0.5);

      const tableLeft = 50;
      const tableRight = 545;
      const col2 = 400;
      const rowHeight = 20;

      const drawRow = (
        label: string,
        value: string,
        bold = false,
        bgColor?: string,
      ): void => {
        const y = doc.y;
        if (bgColor) {
          doc
            .rect(tableLeft, y, tableRight - tableLeft, rowHeight)
            .fill(bgColor)
            .fillColor('black');
        }
        const font = bold ? 'Helvetica-Bold' : 'Helvetica';
        doc.fontSize(11).font(font);
        // Écriture de la ligne : label à gauche, valeur à droite
        doc.text(label, tableLeft + 5, y + 4, {
          width: col2 - tableLeft - 10,
          lineBreak: false,
        });
        doc.text(value, col2, y + 4, {
          width: tableRight - col2 - 5,
          align: 'right',
          lineBreak: false,
        });
        // Avancer manuellement la position Y
        (doc as unknown as { y: number }).y = y + rowHeight;
      };

      drawRow('Prix de base', formatPrice(mission.basePrice));
      drawRow('Options', formatPrice(mission.optionsPrice));
      drawRow('Réduction abonnement', `- ${formatPrice(mission.discount)}`);
      doc.moveTo(tableLeft, doc.y).lineTo(tableRight, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(0.3);
      drawRow('TOTAL', formatPrice(mission.totalPrice), true, '#f0f0f0');

      doc.moveDown(2);

      // Pied de page
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
}
