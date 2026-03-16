import { Injectable } from '@nestjs/common';
import { DetectionResult } from './phone.detector';

@Injectable()
export class EmailDetector {
  detect(original: string, normalized: string): DetectionResult {
    // Email direct
    if (/[\w.\-+]+@[\w.\-]+\.\w{2,}/.test(original)) {
      return { found: true, type: 'email_direct', score: 60 };
    }
    if (/[\w.\-+]+@[\w.\-]+\.\w{2,}/.test(normalized)) {
      return { found: true, type: 'email_obfuscated', score: 60 };
    }

    const lowered = original.toLowerCase();
    const atKeywords = /\b(arobase|arrobase|arobas|at|chez)\b|@/i;
    const dotKeywords = /\b(point|dot|pt)\b/i;
    const domainKeywords = /\b(gmail|hotmail|yahoo|outlook|orange|free|sfr|laposte|icloud|proton|live|msn|aol|wanadoo)\b/i;

    const hasAt = atKeywords.test(lowered);
    const hasDot = dotKeywords.test(lowered);
    const hasDomain = domainKeywords.test(lowered);

    if (hasAt && hasDot) return { found: true, type: 'email_textual', score: 55 };
    if (hasAt && hasDomain) return { found: true, type: 'email_domain', score: 50 };
    if (hasDomain && hasDot) return { found: true, type: 'email_domain_dot', score: 25 };

    if (/[\[({]at[\])}]|[\[({]dot[\])}]/i.test(original)) {
      return { found: true, type: 'email_brackets', score: 55 };
    }

    return { found: false, type: null, score: 0 };
  }
}
