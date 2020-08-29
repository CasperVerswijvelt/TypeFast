import { TextFormat } from './TextSource';

export enum Preference {
  LANGUAGE = 'word_language',
  THEME = 'theme',
  FOLLOW_SYSTEM_THEME = 'follow_system_theme',
  DEFAULT_WORD_MODE = 'default_word_mode',
  REVERSE_SCROLL = 'reverse_scroll',
  DEFAULT_TEST_DURATION = 'default_test_duration',
  TEXT_SIZE = 'text_size',
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
  PROGRAMMING = 'programming',
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum WordMode {
  WORDS = 'words',
  SENTENCES = 'sentences',
}

export enum TextSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export interface Preferences {
  word_language?: Language;
  theme?: Theme;
  follow_system_theme?: boolean;
  default_word_mode?: WordMode;
  reverse_scroll?: boolean;
  default_test_duration?: number;
  text_size?: TextSize;
}
