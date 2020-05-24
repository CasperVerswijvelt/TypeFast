export enum Preference {
  LANGUAGE = 'word_language',
  DARK_MODE = 'dark_mode',
  SHUFFLE_WORDS = 'shuffle_words'
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
  word_language?: string;
  dark_mode?: boolean;
  shuffle_words?: boolean;
}
