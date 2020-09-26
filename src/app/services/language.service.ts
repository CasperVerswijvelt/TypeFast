import { Injectable } from '@angular/core';
import { Language } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor() {}

  private static russian: Record<string, string> = {
    ё: 'e',
  };

  private static arabic: Record<string, string> = {
    أ: 'ا',
    إ: 'ا',
    آ: 'ا',
    ة: 'ه',
    ؤ: 'ء',
    ئ: 'ء',
    ى: 'ي',
  };

  static getLanguageISO(language: Language): string {
    switch (language) {
      case Language.DUTCH:
        return 'nl';
      case Language.ENGLISH_BRITISH:
        return 'en-gb';
      case Language.ENGLISH_AMERICAN:
        return 'en-us';
      case Language.ITALIAN:
        return 'it';
      case Language.DUTCH:
        return 'be';
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
      default:
        return language.charAt(0).toUpperCase() + (language as string).slice(1);
    }
  }

  static compareCharacter(
    actual: string,
    expected: string,
    language: Language = Language.CUSTOM,
    ignoreAccents: boolean = false
  ): boolean {
    if (!ignoreAccents) return actual === expected;
    if (!actual || !expected) return false;
    if (actual.length !== expected.length) return false;
    if (language === Language.CUSTOM) return false;

    return actual === this.getSubstitute(expected, language);
  }

  private static getSubstitute(char: string, language: Language) {
    let substituteMap: Record<string, string>;

    let isUpper = char === char.toUpperCase();

    switch (language) {
      case Language.RUSSIAN:
        substituteMap = this.russian;
        break;
      case Language.ARABIC:
        substituteMap = this.arabic;
        break;
    }

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
    ignoreAccents: boolean = false
  ): boolean {
    if (!actual || !expected) return false;
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
