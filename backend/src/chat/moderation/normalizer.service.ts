import { Injectable } from '@nestjs/common';

export interface NormalizationResult {
  normalized: string;
  lowered: string;
  normalizedNumbers: string;
}

@Injectable()
export class NormalizerService {
  normalize(text: string): NormalizationResult {
    const lowered = text.toLowerCase().trim();

    // Étape 1 : supprimer les séparateurs
    let n = lowered.replace(/[\s.\-_\/\\|,;:()[\]{}<>'"«»*#+~^`!?]+/g, '');

    // Étape 2 : homoglyphes et leet speak
    const homoMap: Record<string, string> = {
      'о': 'o', 'а': 'a', 'е': 'e', 'і': 'i', 'ɑ': 'a',
      'ø': 'o', 'ö': 'o', 'ü': 'u', 'ï': 'i',
      '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a',
    };
    for (const [from, to] of Object.entries(homoMap)) {
      n = n.split(from).join(to);
    }

    // Supprimer accents
    n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Étape 3 : mots-nombres → chiffres (sur lowered avant strip)
    const wordNums: [RegExp, string][] = [
      [/\bzéro\b|\bzero\b/g, '0'],
      [/\bune?\b/g, '1'],
      [/\bdeux\b/g, '2'],
      [/\btrois\b/g, '3'],
      [/\bquatre\b/g, '4'],
      [/\bcinq\b/g, '5'],
      [/\bsix\b/g, '6'],
      [/\bsept\b/g, '7'],
      [/\bhuit\b/g, '8'],
      [/\bneuf\b/g, '9'],
      [/\bdix\b/g, '10'],
      [/\bonze\b/g, '11'],
      [/\bdouze\b/g, '12'],
      [/\btreize\b/g, '13'],
      [/\bquatorze\b/g, '14'],
      [/\bquinze\b/g, '15'],
      [/\bseize\b/g, '16'],
      [/\bvingt\b/g, '20'],
      [/\btrente\b/g, '30'],
      [/\bquarante\b/g, '40'],
      [/\bcinquante\b/g, '50'],
      [/\bsoixante\b/g, '60'],
    ];
    let withNumbers = lowered;
    for (const [pattern, replacement] of wordNums) {
      withNumbers = withNumbers.replace(pattern, replacement);
    }
    const normalizedNumbers = withNumbers.replace(/[\s.\-_\/\\|,;:()[\]{}<>'"«»*#+~^`!?]+/g, '');

    return { normalized: n, lowered, normalizedNumbers };
  }
}
