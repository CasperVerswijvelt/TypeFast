export enum Preference {
  LANGUAGE = 'word_language',
  THEME = 'theme',
  FOLLOW_SYSTEM_THEME = 'follow_system_theme',
  WORD_MODE = 'default_word_mode',
  REVERSE_SCROLL = 'reverse_scroll',
  DEFAULT_TEST_DURATION = 'default_test_duration',
  TEXT_SIZE = 'text_size',
  SMOOTH_SCROLLING = 'smooth_scrolling',
  SCROLLING_ANIMATION = 'scrolling_animation',
  IGNORE_DIACRITICS = 'ignore_diacritics',
  IGNORE_CASING = 'ignore_casing',
}

export enum Language {
  CUSTOM = 'custom',
  ARABIC = 'arabic',
  CHINESE = 'chinese',
  DUTCH = 'dutch',
  ENGLISH_AMERICAN = 'english_american',
  ENGLISH_BRITISH = 'english_british',
  FRENCH = 'french',
  GERMAN = 'german',
  HINDI = 'hindi',
  HUNGARIAN = 'hungarian',
  ITALIAN = 'italian',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  PORTUGUESE = 'portuguese',
  ROMANIAN = 'romanian',
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
  [Preference.LANGUAGE]?: Language;
  [Preference.THEME]?: Theme;
  [Preference.FOLLOW_SYSTEM_THEME]?: boolean;
  [Preference.WORD_MODE]?: WordMode;
  [Preference.REVERSE_SCROLL]?: boolean;
  [Preference.DEFAULT_TEST_DURATION]?: number;
  [Preference.TEXT_SIZE]?: TextSize;
  [Preference.SMOOTH_SCROLLING]?: boolean;
  [Preference.SCROLLING_ANIMATION]?: boolean;
  [Preference.IGNORE_DIACRITICS]?: boolean;
  [Preference.IGNORE_CASING]?: boolean;
}
