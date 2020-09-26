import { Injectable } from '@angular/core';
import { Language } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor() {}

  private static french: Record<string, string> = {
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

    let substitutedExpected = expected;

    switch (language) {
      case Language.FRENCH:
        substitutedExpected = this.getSubstitute(expected, this.french);
    }

    return actual === substitutedExpected;
  }

  private static getSubstitute(
    char: string,
    substituteMap: Record<string, string>
  ) {
    const substitute = substituteMap[char];

    console.log(substitute, substituteMap, char);

    if (substitute) return substitute;

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
