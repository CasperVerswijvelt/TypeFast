import { Theme } from './Theme';

export enum Preference {
  LANGUAGE = 'word_language',
  THEME = 'theme',
  FOLLOW_SYSTEM_THEME = 'follow_system_theme'
}

export enum Language {
  ARABIC = 'arabic',
  CHINESE = 'chinese',
  DUTCH = 'dutch',
  ENGLISH = 'english',
  FRENCH = 'french',
  GERMAN = 'german',
  HINDI = 'hindi',
  HUNGARIAN = 'hungarian',
  ITALIAN = 'italian',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  PORTUGUESE = 'portuguese',
  RUSSIAN = 'russian',
  SPANISH = 'spanish',
}

export interface Preferences {
  word_language?: Language;
  theme?: Theme;
  follow_system_theme?: boolean;
}
