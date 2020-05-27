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
  private listeners: ((wordMode: WordMode) => void)[] = [];

  private DEFAULT_WORD_AMOUNT = 100;

  constructor(private preferencesService: PreferencesService) {
    this.loadLanguage(preferencesService.getPreference(Preference.LANGUAGE));
    preferencesService.addListener(this.onPreferenceUpdated.bind(this));
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
      this.words = ['This', 'language', "doesn't", 'have', 'any', 'words.'];
      this.wordsCopy = [];
    } else if (format === TextFormat.SENTENCES) {
      this.sentenes = [
        ['This', 'language', "doesn't", 'have', 'any', 'sentences.'],
      ];
      this.sentencesCopy = [];
    }
  }

  private onPreferenceUpdated(preference: Preference, value: any) {
    if (preference === Preference.LANGUAGE) {
      this.loadLanguage(value);
    }
  }

  loadFile(file: File): Promise<void> {
    return this.loadTextViaFile(TextFormat.BOTH, file).then(() => {
      this.notifySubscribers(WordMode.WORDS);
      this.notifySubscribers(WordMode.SENTENCES);
    });
  }

  loadLanguage(language: Language): Promise<[void, void]> {
    return Promise.all([
      this.loadTextViaUrl(
        TextFormat.WORDS,
        `assets/languages/${language}/words.txt`
      ).then((value: boolean) => {
        if (value) this.notifySubscribers(WordMode.WORDS);
      }),
      this.loadTextViaUrl(
        TextFormat.SENTENCES,
        `assets/languages/${language}/sentences.txt`
      ).then((value: boolean) => {
        if (value) this.notifySubscribers(WordMode.SENTENCES);
      }),
    ]);
  }

  getWords(wordCount?: number): string[] {
    let res: string[] = [];

    wordCount = wordCount !== undefined ? wordCount : this.DEFAULT_WORD_AMOUNT;

    while (res.length < wordCount) {
      if (this.wordsCopy.length == 0) {
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

    if (this.sentencesCopy.length == 0) {
      this.sentencesCopy = this.sentenes.slice();
    }

    return this.sentencesCopy.splice(
      Math.floor(Math.random() * this.sentencesCopy.length),
      1
    )[0];
  }

  addListener(listenerFunction: (wordMode: WordMode) => void): void {
    this.listeners.push(listenerFunction);

    if (this.wordListLoaded) {
      listenerFunction(WordMode.WORDS);
    }
    if (this.sentenceListLoaded) {
      listenerFunction(WordMode.SENTENCES);
    }
  }

  private notifySubscribers(wordMode: WordMode) {
    this.listeners.forEach((listener) => listener(wordMode));
  }
}
