import { TextFormat } from './TextSource';

export enum Preference {
  LANGUAGE = 'word_language',
  THEME = 'theme',
  FOLLOW_SYSTEM_THEME = 'follow_system_theme',
  DEFAULT_WORD_MODE = 'default_word_mode'
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

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum WordMode {
  WORDS = "words",
  SENTENCES = "sententes"
}


export interface Preferences {
  word_language?: Language;
  theme?: Theme;
  follow_system_theme?: boolean;
  default_word_mode?: WordMode
}

