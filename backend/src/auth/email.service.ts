import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.from = this.configService.get<string>('RESEND_FROM_EMAIL') ?? 'noreply@seliv.fr';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    if (apiKey && apiKey !== 're_placeholder') {
      this.resend = new Resend(apiKey);
    } else {
      this.resend = null;
      this.logger.warn('RESEND_API_KEY not configured — emails will be logged only');
    }
  }

  async sendPasswordReset(email: string, firstName: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    if (!this.resend) {
      this.logger.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: 'Réinitialisation de votre mot de passe SELIV',
        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head><meta charset="UTF-8"></head>
          <body style="font-family:sans-serif;background:#0f091c;color:#e8e0f5;margin:0;padding:40px 20px;">
            <div style="max-width:520px;margin:0 auto;background:#1a0f2e;border:1px solid #2d2060;border-radius:16px;padding:40px;">
              <h1 style="color:#7a38f5;font-size:28px;font-weight:900;margin:0 0 8px;">SELIV</h1>
              <p style="color:#9d8ec5;font-size:14px;margin:0 0 32px;">La plateforme du live selling</p>

              <p style="font-size:16px;margin:0 0 8px;">Bonjour <strong>${firstName}</strong>,</p>
              <p style="font-size:14px;color:#9d8ec5;margin:0 0 32px;">
                Nous avons reçu une demande de réinitialisation de votre mot de passe.
                Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
              </p>

              <a href="${resetUrl}"
                 style="display:inline-block;background:#7a38f5;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;margin-bottom:32px;">
                Réinitialiser mon mot de passe
              </a>

              <p style="font-size:12px;color:#6b5f8a;margin:0 0 8px;">
                Ce lien expire dans <strong>1 heure</strong>.
              </p>
              <p style="font-size:12px;color:#6b5f8a;margin:0;">
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre mot de passe restera inchangé.
              </p>

              <hr style="border:none;border-top:1px solid #2d2060;margin:32px 0;">
              <p style="font-size:11px;color:#4a3f6a;margin:0;">
                SELIV — <a href="${this.frontendUrl}" style="color:#7a38f5;">${this.frontendUrl}</a>
              </p>
            </div>
          </body>
          </html>
        `,
      });
    } catch (err) {
      this.logger.error(`Failed to send reset email to ${email}`, err);
    }
  }
}
