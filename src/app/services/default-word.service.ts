import { Injectable, SystemJsNgModuleLoader } from '@angular/core';
import { WordService } from './word.service';
import { PreferencesService } from './preferences.service';
import { Preference } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export class DefaultWordService implements WordService {
  private words: string[] = ['Word', 'list', 'not', 'initialized', 'yet.'];
  private wordListLoaded = false;
  private listeners: (() => void)[] = [];

  constructor(private preferencesService: PreferencesService) {
    this.reloadWordList();

    preferencesService.addListener(this.onPreferenceUpdated.bind(this));
  }

  private onPreferenceUpdated(preference : Preference, value : any) {
    if (preference === Preference.LANGUAGE) {
      this.reloadWordList();
    }
  }

  reprocessWordList(): void {
    this.notifySubscribers();
  }

  reloadWordList(): void {
    
    this.loadWordListUrl(`assets/words/${this.preferencesService.getPreference(
      Preference.LANGUAGE
    )}.txt`);
  }

  loadWordListLocal(file: File): void {

    if (file.type !== "text/plain") return;

    let reader = new FileReader();
    reader.onload = (event : ProgressEvent<FileReader>) => {
      let text = reader.result as string;
      this.loadWordListText(text);
    };
    reader.readAsText(file);
  }

  async loadWordListUrl(url: string): Promise<void> {

    const response = await fetch(url);
    const text = await response.text();
    this.loadWordListText (text);
  }

  getWords(shuffle?: boolean, wordCount?: number): string[] {
    let data: string[] = [];
    let res: string[] = [];

    if (typeof wordCount !== 'undefined') {
      while (res.length < wordCount) {

        if (data.length == 0) {
          data = this.words.slice();
        }
        
        if (shuffle === false) {

          // Take as many words as we need or as we can (whichever is less)
          res = res.concat(data.splice(0, Math.min(data.length, wordCount - res.length)));
          
        } else {

          // Take 1 word randomly from dataset and push it to result words
          res.push(data.splice(Math.floor(Math.random() * data.length), 1)[0]);
        }

      }
    } else {
      res = data;
    }

    return res;
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

  private loadWordListText(text : string) {
    this.words = text.split(/\r?\n?\s/);
    this.wordListLoaded = true;
    this.notifySubscribers();
  }
}
