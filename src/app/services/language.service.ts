import { Injectable } from '@angular/core';
import { Language } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor() {}

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
}
