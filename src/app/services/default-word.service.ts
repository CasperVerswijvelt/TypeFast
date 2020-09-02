import { Injectable, SystemJsNgModuleLoader } from '@angular/core';
import { WordService } from './word.service';
import { PreferencesService } from './preferences.service';
import { Preference, Language, WordMode } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export class DefaultWordService implements WordService {
  private words: string[] = ['Word', 'list', 'not', 'initialized', 'yet.'];
  private sentenes: string[][] = [['This', 'language', "doesn't", 'have', 'any', 'sentences.']];

  private wordsCopy: string[] = [];
  private sentencesCopy: string[][] = [];

  private lastLoadedListMode: WordMode = undefined;
  private currentSource: string;
  private wordListListeners: ((wordMode: WordMode, wordListName: string, shouldReverseScroll: boolean) => void)[] = [];
  private languageFetchListeners: ((language: Language, promise: Promise<void>) => void)[] = [];

  private DEFAULT_WORD_AMOUNT = 100;

  constructor(private preferencesService: PreferencesService) {
    let preferences = this.preferencesService.getPreferences();

    preferences.get(Preference.LANGUAGE).subscribe(this.onLanguagePreferenceUpdated.bind(this));
    preferences.get(Preference.WORD_MODE).subscribe(this.onWordModePreferenceUpdated.bind(this));
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
      if (response.status !== 200) return Promise.reject("Text file couldn't be fetched");
      return response.text();
    });
  }

  private parseText(wordMode: WordMode, text: string) {
    if (wordMode === WordMode.WORDS) {
      this.words = text.split(/\s+/);
      this.wordsCopy = [];
    }
    if (wordMode === WordMode.SENTENCES) {
      let tempSentences = [];
      let lines = text.match(/[^\r\n]+/g);
      lines.forEach((line) => {
        tempSentences.push(line.split(/\s+/));
      });
      this.sentenes = tempSentences;
      this.sentencesCopy = [];
    }
  }

  private loadTextViaUrl(format: WordMode, url: string): Promise<void> {
    try {
      return this.getTextViaUrl(url).then((text) => {
        this.parseText(format, text);
      });
    } catch (e) {
      return Promise.reject(`Couldn't load text via url, err: ${e}`);
    }
  }

  private loadTextViaFile(format: WordMode, file: File): Promise<void> {
    try {
      return this.getTextViaFile(file).then((text) => {
        this.parseText(format, text);
      });
    } catch (e) {
      return Promise.reject(`Couldn't load text via file, err: ${e}`);
    }
  }

  private loadDefaultList(format: WordMode) {
    if (format === WordMode.WORDS) {
      this.words = ['This', 'list', "doesn't", 'have', 'any', 'words.'];
      this.wordsCopy = [];
    } else if (format === WordMode.SENTENCES) {
      this.sentenes = [['This', 'list', "doesn't", 'have', 'any', 'sentences.']];
      this.sentencesCopy = [];
    }
  }

  private onLanguagePreferenceUpdated(value: any) {
    this.loadLanguage(
      value,
      this.preferencesService.getPreferences().get(Preference.WORD_MODE).value === WordMode.WORDS
        ? WordMode.WORDS
        : WordMode.SENTENCES
    );
  }

  private onWordModePreferenceUpdated(value: any) {}

  loadFile(file: File, wordMode: WordMode): Promise<void> {
    return this.loadTextViaFile(wordMode, file).then(() => {
      this.currentSource = file.name;
      this.notifyWordListSubscribers(WordMode.WORDS, file.name, false);
      this.notifyWordListSubscribers(WordMode.SENTENCES, file.name, false);
    });
  }

  loadLanguage(language: Language, wordMode: WordMode): Promise<void> {
    console.log('loadLanguage', language, wordMode);
    let langString = language.charAt(0).toUpperCase() + (language as string).slice(1);

    let promise = this.loadTextViaUrl(wordMode, `assets/languages/${language}/words.txt`)
      .then(() => {
        this.lastLoadedListMode = wordMode;
        this.currentSource = langString;
        this.notifyWordListSubscribers(wordMode, langString, this.shouldReverseScroll(language));
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
      res.push(this.wordsCopy.splice(Math.floor(Math.random() * this.wordsCopy.length), 1)[0]);
    }

    return res;
  }

  private getSentence(): string[] {
    let res: string[] = [];

    if (this.sentencesCopy.length === 0) {
      this.sentencesCopy = this.sentenes.slice();
    }

    return this.sentencesCopy.splice(Math.floor(Math.random() * this.sentencesCopy.length), 1)[0];
  }

  addWordListListener(
    listenerFunction: (wordMode: WordMode, wordListName: string, shouldReverseScroll: boolean) => void
  ): void {
    this.wordListListeners.push(listenerFunction);

    if (this.lastLoadedListMode) {
      listenerFunction(this.lastLoadedListMode, this.currentSource, false);
    }
  }

  addLanguageFetchListener(onLanguageFetch: (language: Language, promise: Promise<void>) => void): void {
    this.languageFetchListeners.push(onLanguageFetch);
  }

  private notifyWordListSubscribers(wordMode: WordMode, wordListName: string, shouldReverseScroll: boolean) {
    this.wordListListeners.forEach((listener) => listener(wordMode, wordListName, shouldReverseScroll));
  }

  private notifyLanguageFetchSubscribers(language: Language, promise: Promise<any>) {
    this.languageFetchListeners.forEach((listener) => listener(language, promise));
  }

  private shouldReverseScroll(language: Language) {
    return language == Language.ARABIC;
  }
}
