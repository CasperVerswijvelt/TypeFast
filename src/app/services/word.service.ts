import { Injectable } from '@angular/core';
import { PreferencesService } from './preferences.service';
import { Preference, Language, WordMode } from '../models/Preference';
import { skip } from 'rxjs/operators';

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

  private lastLoadedListMode: WordMode = undefined;
  private currentSource: string;
  private wordListListeners: ((
    wordMode: WordMode,
    wordListName: string,
    shouldReverseScroll: boolean
  ) => void)[] = [];
  private languageFetchListeners: ((
    language: Language,
    promise: Promise<void>
  ) => void)[] = [];

  private DEFAULT_WORD_AMOUNT = 100;

  constructor(private preferencesService: PreferencesService) {
    let preferences = this.preferencesService.getPreferences();

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

  private getTextViaFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.type !== 'text/plain') reject('File is not a text file');
      let fr = new FileReader();
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
      let tempSentences = [];
      let lines = text.match(/[^\r\n]+/g);
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

  private onLanguagePreferenceUpdated(value: any) {
    this.loadLanguage(
      value,
      this.preferencesService.getPreference(Preference.WORD_MODE) ===
        WordMode.WORDS
        ? WordMode.WORDS
        : WordMode.SENTENCES
    );
  }

  private onWordModePreferenceUpdated(value: any) {
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
    console.log('loadLanguage', language, wordMode);
    const langString =
      language.charAt(0).toUpperCase() + (language as string).slice(1);

    const textPromise =
      language === Language.CUSTOM
        ? Promise.resolve(this.cachedFileText)
        : this.getTextViaUrl(`assets/languages/${language}/${wordMode}.txt`);

    const promise = textPromise
      .then((text) => {
        this.parseText(wordMode, text);
      })
      .then(() => {
        this.lastLoadedListMode = wordMode;
        this.currentSource = langString;
        this.notifyWordListSubscribers(
          wordMode,
          langString,
          this.shouldReverseScroll(language)
        );
      })
      .catch((e) => {
        this.loadDefaultList(WordMode.WORDS);
      });

    this.notifyLanguageFetchSubscribers(language, promise);

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

  private getRandomWords(wordCount?: number): string[] {
    let res: string[] = [];

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
    let res: string[] = [];

    if (this.sentencesCopy.length === 0) {
      this.sentencesCopy = this.sentenes.slice();
    }

    return this.sentencesCopy.splice(
      Math.floor(Math.random() * this.sentencesCopy.length),
      1
    )[0];
  }

  addWordListListener(
    listenerFunction: (
      wordMode: WordMode,
      wordListName: string,
      shouldReverseScroll: boolean
    ) => void
  ): void {
    this.wordListListeners.push(listenerFunction);

    if (this.lastLoadedListMode) {
      listenerFunction(this.lastLoadedListMode, this.currentSource, false);
    }
  }

  addLanguageFetchListener(
    onLanguageFetch: (language: Language, promise: Promise<void>) => void
  ): void {
    this.languageFetchListeners.push(onLanguageFetch);
  }

  private notifyWordListSubscribers(
    wordMode: WordMode,
    wordListName: string,
    shouldReverseScroll: boolean
  ) {
    this.wordListListeners.forEach((listener) =>
      listener(wordMode, wordListName, shouldReverseScroll)
    );
  }

  private notifyLanguageFetchSubscribers(
    language: Language,
    promise: Promise<any>
  ) {
    this.languageFetchListeners.forEach((listener) =>
      listener(language, promise)
    );
  }

  private shouldReverseScroll(language: Language) {
    return language === Language.ARABIC;
  }
}
