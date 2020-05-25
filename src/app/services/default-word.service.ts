import { Injectable, SystemJsNgModuleLoader } from '@angular/core';
import { WordService } from './word.service';
import { PreferencesService } from './preferences.service';
import { Preference, Language } from '../models/Preference';
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
  private listeners: (() => void)[] = [];

  private DEFAULT_WORD_AMOUNT = 100;

  constructor(private preferencesService: PreferencesService) {
    this.loadLanguage(preferencesService.getPreference(Preference.LANGUAGE)).then(this.notifySubscribers.bind(this));
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
    } 
    if (format === TextFormat.SENTENCES || format === TextFormat.BOTH) {
      let tempSentences = [];
      let lines = text.split(/\r|\n/);
      lines.forEach((line) => tempSentences.push(line.split(/\r|\n|\s/)));
      this.sentenes = tempSentences;
      this.sentencesCopy = [];
    }
  }

  async loadTextViaUrl(format: TextFormat, url: string): Promise<boolean> {
    try {
      let text = await this.getTextViaUrl(url);
      this.parseText(format, text);
      return true;
    } catch (e) {
      this.loadDefaultList(format);
    }
    return false;
  }

  async loadTextViaFile(format: TextFormat, file: File): Promise<boolean> {
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
      this.loadLanguage(value).then(this.notifySubscribers.bind(this));
    }
  }

  loadLanguage(language: Language): Promise<[boolean,boolean]> {
    return Promise.all([
      this.loadTextViaUrl(
        TextFormat.WORDS,
        `assets/languages/${language}/words.txt`
      ),
      this.loadTextViaUrl(
        TextFormat.SENTENCES,
        `assets/languages/${language}/sentences.txt`
      ),
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

  addListener(listenerFunction: () => void): void {
    this.listeners.push(listenerFunction);

    if (this.wordListLoaded) {
      listenerFunction();
    }
  }

  notifySubscribers() {
    this.listeners.forEach((listener) => listener());
  }

  private loadWordListText(text: string) {
    this.words = text.split(/\r?\n?\s/);
    this.wordListLoaded = true;
    this.notifySubscribers();
  }
}
