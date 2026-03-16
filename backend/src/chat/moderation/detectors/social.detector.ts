import { Injectable } from '@nestjs/common';
import { DetectionResult } from './phone.detector';

@Injectable()
export class SocialDetector {
  detect(original: string, normalized: string): DetectionResult {
    const lowered = original.toLowerCase();

    // Apps messagerie
    const messagingApps: [string, number][] = [
      ['whatsapp', 60], ['whatsap', 60], ['watsapp', 60], ['watsap', 60],
      ['whatapp', 60], ['whatspp', 60],
      ['telegram', 60],
      ['viber', 50],
    ];
    for (const [app, score] of messagingApps) {
      if (normalized.includes(app)) {
        return { found: true, type: 'messaging_app', score };
      }
    }

    // Signal (mot commun — contexte requis)
    if (normalized.includes('signal')) {
      if (/(sur|via|mon|app|appli)\s*signal/i.test(lowered)) {
        return { found: true, type: 'messaging_app', score: 40 };
      }
    }

    // Réseaux sociaux
    const socialApps: [string, number][] = [
      ['instagram', 50], ['insta', 40],
      ['snapchat', 50],
      ['facebook', 50], ['messenger', 50],
      ['tiktok', 40],
      ['discord', 40],
      ['skype', 50],
    ];
    for (const [app, score] of socialApps) {
      if (normalized.includes(app)) {
        return { found: true, type: 'social_network', score };
      }
    }

    // "snap" ambigu — contexte requis
    if (normalized.includes('snap')) {
      if (/(sur|mon|ajoute|add)\s*snap/i.test(lowered)) {
        return { found: true, type: 'social_network', score: 30 };
      }
    }

    // Pseudo @
    if (/@[\w.]{3,}/.test(original) && !/@seliv/i.test(original)) {
      return { found: true, type: 'pseudo', score: 30 };
    }

    // URLs
    if (/https?:\/\/|www\./i.test(original)) {
      return { found: true, type: 'url_direct', score: 50 };
    }
    if (/\.(com|fr|net|org|io)\b/i.test(lowered) && /(instagram|facebook|tiktok|snap|wa\.me)/i.test(lowered)) {
      return { found: true, type: 'url_social', score: 50 };
    }

    // Phrases d'invitation
    const invitePatterns = [
      /(ajoute|ajt|add)\s*(moi|me)\s*(sur|on)/i,
      /(retrouve|trouve|cherche|contacte?|rejoins?)\s*(moi|me)\s*(sur|on)/i,
      /(mon|ma|mes)\s+(insta|snap|tt|fb|ig|compte|profil|pseudo|id)\b/i,
      /(écris|envoie|text|msg|dm|mp|message)\s*(moi|me)\b/i,
      /\ben\s*(privé|pv|dm|mp)\b/i,
      /hors\s*(de\s*)?(la\s*)?(plateforme|seliv|appli|app)/i,
      /(appelle?|tel|téléphone)\s*(moi|me)\b/i,
    ];
    for (const pattern of invitePatterns) {
      if (pattern.test(lowered)) {
        return { found: true, type: 'invite_phrase', score: 35 };
      }
    }

    return { found: false, type: null, score: 0 };
  }
}
