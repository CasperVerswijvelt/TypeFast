import { Injectable } from '@angular/core';
import { PreferencesService } from './preferences.service';
import { Preference, Language, WordMode } from '../models/Preference';
import { skip } from 'rxjs/operators';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root',
})
export class WordService {
  private words: string[] = ['Word', 'list', 'not', 'initialized', 'yet.'];
  private sentenes: string[][] = [
    ['This', 'language', "doesn't", 'have', 'any', 'sentences.'],
  ];

  private cachedFileText: string;
  private cachedFileName: string;

  private wordsCopy: string[] = [];
  private sentencesCopy: string[][] = [];

  private lastLoadedListLanguage: Language = undefined;
  private lastLoadedListMode: WordMode = undefined;
  private currentSource: string;
  private wordListListeners: ((
    language: Language,
    wordMode: WordMode,
    wordListName: string,
    shouldReverseScroll: boolean
  ) => void)[] = [];
  private languageFetchListeners: ((
    language: Language,
    wordMode: WordMode,
    promise: Promise<void>
  ) => void)[] = [];

  private DEFAULT_WORD_AMOUNT = 100;

  private LANGUAGE_PREFERENCE_CHANGED =
    'Language preference changed during loading, cancelling.';

  constructor(private preferencesService: PreferencesService) {
    const preferences = this.preferencesService.getPreferences();

    preferences
      .get(Preference.LANGUAGE)
      .pipe(skip(1))
      .subscribe(this.onLanguagePreferenceUpdated.bind(this));
    preferences
      .get(Preference.WORD_MODE)
      .pipe(skip(1))
      .subscribe(this.onWordModePreferenceUpdated.bind(this));

    this.loadLanguage(
      this.preferencesService.getPreference(Preference.LANGUAGE),
      this.preferencesService.getPreference(Preference.WORD_MODE)
    );
  }

  private onLanguagePreferenceUpdated(value: any): void {
    this.loadLanguage(
      value,
      this.preferencesService.getPreference(Preference.WORD_MODE) ===
        WordMode.WORDS
        ? WordMode.WORDS
        : WordMode.SENTENCES
    );
  }

  private onWordModePreferenceUpdated(value: any): void {
    this.loadLanguage(
      this.preferencesService.getPreference(Preference.LANGUAGE),
      value
    );
  }

  loadFile(file: File): Promise<void> {
    return this.getTextViaFile(file).then((text) => {
      this.cachedFileText = text;
      this.cachedFileName = file.name;
    });
  }

  loadLanguage(language: Language, wordMode: WordMode): Promise<void> {
    const langString = this.getLanguageString(language);
    const getTextPromise =
      language === Language.CUSTOM
        ? Promise.resolve(this.cachedFileText)
        : this.getTextViaUrl(`assets/languages/${language}/${wordMode}.txt`);

    const promise = getTextPromise
      .then((text: string) => {
        // Only parse text if this language is still the preferred language, otherwise reject
        if (
          this.preferencesService.getPreference(Preference.LANGUAGE) ===
          language
        ) {
          this.parseText(wordMode, text);
        } else {
          return Promise.reject(this.LANGUAGE_PREFERENCE_CHANGED);
        }
        this.lastLoadedListLanguage = language;
        this.lastLoadedListMode = wordMode;
        this.currentSource = langString;
        this.notifyWordListSubscribers(
          language,
          wordMode,
          langString,
          this.shouldReverseScroll(language)
        );
      })
      .catch((e) => {
        if (e !== this.LANGUAGE_PREFERENCE_CHANGED)
          this.loadDefaultList(WordMode.WORDS);
      });

    this.notifyLanguageFetchSubscribers(language, wordMode, promise);

    return promise;
  }

  getWords(wordCount?: number): string[] {
    if (this.lastLoadedListMode === WordMode.WORDS) {
      return this.getRandomWords(wordCount);
    } else if (this.lastLoadedListMode === WordMode.SENTENCES) {
      return this.getSentence();
    } else {
      return 'No word list has been loaded yet.'.split(' ');
    }
  }

  getCachedFileName(): string {
    return this.cachedFileName;
  }

  getLanguageString(language: Language): string {
    let langString = LanguageService.getLanguageString(language);
    if (language === Language.CUSTOM && this.cachedFileName)
      langString = `'${this.cachedFileName}'`;
    return langString;
  }

  addWordListListener(
    listenerFunction: (
      language: Language,
      wordMode: WordMode,
      wordListName: string,
      shouldReverseScroll: boolean
    ) => void
  ): void {
    this.wordListListeners.push(listenerFunction);

    if (this.lastLoadedListMode) {
      listenerFunction(
        this.lastLoadedListLanguage,
        this.lastLoadedListMode,
        this.currentSource,
        false
      );
    }
  }

  addLanguageFetchListener(
    onLanguageFetch: (
      language: Language,
      wordMode: WordMode,
      promise: Promise<void>
    ) => void
  ): void {
    this.languageFetchListeners.push(onLanguageFetch);
  }

  private getTextViaFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.type !== 'text/plain') reject('File is not a text file');
      const fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result as string);
      };
      fr.readAsText(file);
    });
  }

  private getTextViaUrl(url: string): Promise<string> {
    return fetch(url).then((response) => {
      if (response.status !== 200)
        return Promise.reject("Text file couldn't be fetched");
      return response.text();
    });
  }

  private parseText(wordMode: WordMode, text: string) {
    if (wordMode === WordMode.WORDS) {
      this.words = text.split(/\s+/);
      this.wordsCopy = [];
    } else if (wordMode === WordMode.SENTENCES) {
      const tempSentences = [];
      const lines = text.match(/[^\r\n]+/g);
      lines.forEach((line) => {
        tempSentences.push(line.split(/\s+/));
      });
      this.sentenes = tempSentences;
      this.sentencesCopy = [];
    }
  }

  private loadDefaultList(format: WordMode) {
    if (format === WordMode.WORDS) {
      this.words = ['This', 'list', "doesn't", 'have', 'any', 'words.'];
      this.wordsCopy = [];
    } else if (format === WordMode.SENTENCES) {
      this.sentenes = [
        ['This', 'list', "doesn't", 'have', 'any', 'sentences.'],
      ];
      this.sentencesCopy = [];
    }
  }

  private getRandomWords(wordCount?: number): string[] {
    const res: string[] = [];

    wordCount = wordCount !== undefined ? wordCount : this.DEFAULT_WORD_AMOUNT;

    while (res.length < wordCount) {
      if (this.wordsCopy.length === 0) {
        this.wordsCopy = this.words.slice();
      }
      res.push(
        this.wordsCopy.splice(
          Math.floor(Math.random() * this.wordsCopy.length),
          1
        )[0]
      );
    }

    return res;
  }

  private getSentence(): string[] {
    if (this.sentencesCopy.length === 0) {
      this.sentencesCopy = this.sentenes.slice();
    }

    return this.sentencesCopy.splice(
      Math.floor(Math.random() * this.sentencesCopy.length),
      1
    )[0];
  }

  private notifyWordListSubscribers(
    language: Language,
    wordMode: WordMode,
    wordListName: string,
    shouldReverseScroll: boolean
  ) {
    this.wordListListeners.forEach((listener) =>
      listener(language, wordMode, wordListName, shouldReverseScroll)
    );
  }

  private notifyLanguageFetchSubscribers(
    language: Language,
    wordMode: WordMode,
    promise: Promise<any>
  ) {
    this.languageFetchListeners.forEach((listener) =>
      listener(language, wordMode, promise)
    );
  }

  private shouldReverseScroll(language: Language) {
    return (
      language === Language.ARABIC ||
      language === Language.UYGHUR
    );
  }
}
