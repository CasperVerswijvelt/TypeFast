import { Injectable } from '@angular/core';
import { Language } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private static readonly substituteMaps: Record<
    string,
    Record<string, string>
  > = {
    [Language.RUSSIAN]: {
      ё: 'е',
    },
    [Language.ARABIC]: {
      أ: 'ا',
      إ: 'ا',
      آ: 'ا',
      ة: 'ه',
      ؤ: 'ء',
      ئ: 'ء',
      ى: 'ي',
    },
    [Language.CATALAN]: {
      à: 'a',
      é: 'e',
      è: 'e',
      í: 'i',
      ï: 'i',
      ò: 'o',
      ó: 'o',
      ú: 'u',
      ü: 'u',
      ç: 'c',
    },
    [Language.FRENCH]: {
      â: 'a',
      à: 'a',
      á: 'a',
      é: 'e',
      è: 'e',
      ë: 'e',
      ê: 'e',
      ì: 'i',
      î: 'i',
      ï: 'i',
      ù: 'u',
      û: 'u',
      ü: 'u',
      ç: 'c',
    },
    [Language.ROMANIAN]: {
      â: 'a',
      ă: 'a',
      î: 'i',
      ș: 's',
      ț: 't',
    },
    [Language.DUTCH]: {
      é: 'e',
      è: 'e',
      ë: 'e',
      ê: 'e',
      ü: 'u',
      ç: 'c',
    },
    [Language.GERMAN]: {
      ä: 'a',
      ö: 'o',
      ü: 'u',
      ß: 's',
    },
    [Language.SPANISH]: {
      á: 'a',
      é: 'e',
      í: 'i',
      ó: 'o',
      ú: 'u',
      ü: 'u',
    },
    [Language.PORTUGUESE]: {
      á: 'a',
      â: 'a',
      ã: 'a',
      à: 'a',
      ç: 'c',
      é: 'e',
      ê: 'e',
      è: 'e',
      í: 'i',
      ì: 'i',
      ó: 'o',
      ô: 'o',
      õ: 'o',
      ò: 'o',
      ú: 'u',
      ù: 'u'
    },
  };

  // Use ISO 639-1 standard for language codes,
  //  see https://www.andiamo.co.uk/resources/iso-language-codes/
  static getLanguageISO(language: Language): string {
    switch (language) {
      case Language.DUTCH:
        return 'nl';
      case Language.CATALAN:
        return 'ca';
      case Language.ENGLISH_BRITISH:
        return 'en-gb';
      case Language.ENGLISH_AMERICAN:
        return 'en-us';
      case Language.ENGLISH_200:
        return 'en-gb';
      case Language.ITALIAN:
        return 'it';
      case Language.HINDI:
        return 'in';
      case Language.HUNGARIAN:
        return 'hu';
      case Language.JAPANESE:
        return 'jp';
      case Language.KOREAN:
        return 'kr';
      case Language.CHINESE:
        return 'cn';
      case Language.ROMANIAN:
        return 'ro';
      case Language.RUSSIAN:
        return 'ru';
      case Language.SPANISH:
        return 'es';
      case Language.PORTUGUESE:
        return 'pt';
      case Language.FRENCH:
        return 'fr';
      case Language.GERMAN:
        return 'de';
      case Language.ARABIC:
        return 'sa';
      case Language.INDONESIAN:
        return 'id';
      case Language.PROGRAMMING:
        return 'dev';
      case Language.CUSTOM:
        return 'custom';
      default:
        return 'unknown';
    }
  }

  static getLanguageString(language: Language): string {
    switch (language) {
      case Language.ENGLISH_BRITISH:
        return 'English (UK)';
      case Language.ENGLISH_AMERICAN:
        return 'English (US)';
      case Language.ENGLISH_200:
        return 'English (200)';
      default:
        return language.charAt(0).toUpperCase() + (language as string).slice(1);
    }
  }

  static compareCharacter(
    actual: string,
    expected: string,
    language: Language = Language.CUSTOM,
    ignoreAccents = false
  ): boolean {
    if (!actual || !expected) return false;
    if (actual.length !== expected.length) return false;
    if (!ignoreAccents) return actual === expected;

    return (
      actual === expected || actual === this.getSubstitute(expected, language)
    );
  }

  private static getSubstitute(char: string, language: Language) {
    const isUpper = char === char.toUpperCase();
    const substituteMap: Record<string, string> = this.substituteMaps[language];

    if (substituteMap) {
      const substitute = substituteMap[char.toLowerCase()];

      if (substitute) return isUpper ? substitute.toUpperCase() : substitute;
    }

    return char;
  }

  static compare(
    actual: string,
    expected: string,
    language: Language = Language.CUSTOM,
    ignoreAccents = false
  ): boolean {
    if (typeof actual !== 'string' || typeof expected !== 'string')
      return false;
    if (actual.length !== expected.length) return false;

    const length = actual.length;

    for (let i = 0; i < length; i++) {
      if (
        !this.compareCharacter(actual[i], expected[i], language, ignoreAccents)
      ) {
        return false;
      }
    }

    return true;
  }
}
