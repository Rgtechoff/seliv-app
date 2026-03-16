import { Injectable } from '@nestjs/common';

export interface DetectionResult {
  found: boolean;
  type: string | null;
  score: number;
}

@Injectable()
export class PhoneDetector {
  detect(normalized: string, normalizedNumbers: string): DetectionResult {
    // Tester sur le texte normalisé (homoglyphes remplacés)
    const targets = [normalized, normalizedNumbers];

    for (const t of targets) {
      if (/0[67]\d{8}/.test(t)) return { found: true, type: 'phone_mobile', score: 60 };
      if (/\+?33[67]\d{8}/.test(t)) return { found: true, type: 'phone_mobile_intl', score: 60 };
      if (/0[1-5]\d{8}/.test(t)) return { found: true, type: 'phone_fixe', score: 55 };
      if (/\+?33[1-5]\d{8}/.test(t)) return { found: true, type: 'phone_fixe_intl', score: 55 };
      if (/\d{10,}/.test(t)) return { found: true, type: 'phone_long', score: 40 };
      if (/\d{8,9}/.test(t)) return { found: true, type: 'phone_partial', score: 20 };
    }

    return { found: false, type: null, score: 0 };
  }
}
