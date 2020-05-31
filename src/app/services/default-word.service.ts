import { Injectable, SystemJsNgModuleLoader } from '@angular/core';
import { WordService } from './word.service';
import { PreferencesService } from './preferences.service';
import { Preference, Language, WordMode } from '../models/Preference';
import { TextFormat } from '../models/TextSource';

@Injectable({
  providedIn: 'root',
})
export class DefaultWordService implements WordService {
  private words: string[] = ['Word', 'list', 'not', 'initialized', 'yet.'];
  private sentenes: string[][] = [
    ['This', 'language', "doesn't", 'have', 'any', 'sentences.'],
  ];

  private wordsCopy: string[] = [];
  private sentencesCopy: string[][] = [];

  private wordListLoaded = false;
  private sentenceListLoaded = false;
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
    let tes = preferencesService
      .getPreferences()
      .get(Preference.LANGUAGE)
      .subscribe(this.onLanguagePreferenceUpdated.bind(this));
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

  private parseText(format: TextFormat, text: string) {
    if (format === TextFormat.WORDS || format === TextFormat.BOTH) {
      this.words = text.split(/\s+/);
      this.wordsCopy = [];
      this.wordListLoaded = true;
    }
    if (format === TextFormat.SENTENCES || format === TextFormat.BOTH) {
      let tempSentences = [];
      let lines = text.match(/[^\r\n]+/g);
      lines.forEach((line) => {
        tempSentences.push(line.split(/\s+/));
      });
      this.sentenes = tempSentences;
      this.sentencesCopy = [];
      this.sentenceListLoaded = true;
    }
  }

  private async loadTextViaUrl(
    format: TextFormat,
    url: string
  ): Promise<boolean> {
    try {
      let text = await this.getTextViaUrl(url);
      this.parseText(format, text);
      return true;
    } catch (e) {
      this.loadDefaultList(format);
    }
    return false;
  }

  private async loadTextViaFile(
    format: TextFormat,
    file: File
  ): Promise<boolean> {
    try {
      let text = await this.getTextViaFile(file);
      this.parseText(format, text);
      return true;
    } catch (e) {
      this.loadDefaultList(format);
      return false;
    }
  }

  private loadDefaultList(format: TextFormat) {
    if (format === TextFormat.WORDS) {
      this.words = ['This', 'list', "doesn't", 'have', 'any', 'words.'];
      this.wordsCopy = [];
    } else if (format === TextFormat.SENTENCES) {
      this.sentenes = [
        ['This', 'list', "doesn't", 'have', 'any', 'sentences.'],
      ];
      this.sentencesCopy = [];
    }
  }

  private onLanguagePreferenceUpdated(value: any) {
    this.loadLanguage(value);
  }

  loadFile(file: File): Promise<void> {
    return this.loadTextViaFile(TextFormat.BOTH, file).then(() => {
      this.currentSource = file.name;
      this.notifyWordListSubscribers(WordMode.WORDS, file.name, false);
      this.notifyWordListSubscribers(WordMode.SENTENCES, file.name, false);
    });
  }

  loadLanguage(language: Language): Promise<[void, void]> {
    let langString =
      language.charAt(0).toUpperCase() + (language as string).slice(1);
    let promise = Promise.all([
      this.loadTextViaUrl(
        TextFormat.WORDS,
        `assets/languages/${language}/words.txt`
      ).then((value: boolean) => {
        this.notifyWordListSubscribers(
          WordMode.WORDS,
          langString,
          this.shouldReverseScroll(language)
        );
        this.currentSource = langString;
        if (!value) this.loadDefaultList(TextFormat.WORDS);
      }),
      this.loadTextViaUrl(
        TextFormat.SENTENCES,
        `assets/languages/${language}/sentences.txt`
      ).then((value: boolean) => {
        this.notifyWordListSubscribers(
          WordMode.SENTENCES,
          langString,
          this.shouldReverseScroll(language)
        );
        this.currentSource = langString;
        if (!value) this.loadDefaultList(TextFormat.WORDS);
      }),
    ]);

    setTimeout(() => {});

    this.notifyLanguageFetchSubscribers(language, promise);

    return promise;
  }

  getWords(wordCount?: number): string[] {
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

  getSentence(): string[] {
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

    if (this.wordListLoaded) {
      listenerFunction(WordMode.WORDS, this.currentSource, false);
    }
    if (this.sentenceListLoaded) {
      listenerFunction(WordMode.SENTENCES, this.currentSource, false);
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
    return language == Language.ARABIC;
  }
}
