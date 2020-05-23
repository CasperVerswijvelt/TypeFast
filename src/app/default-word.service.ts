import { Injectable, SystemJsNgModuleLoader } from '@angular/core';
import { WordService } from './word.service';
import { PreferencesService } from './preferences.service';
import { Preference } from './Preference';

@Injectable({
  providedIn: 'root',
})
export class DefaultWordService implements WordService {
  private words: string[] = ['Word', 'list', 'not', 'initialized', 'yet.'];
  private wordListLoaded = false;
  private listeners: (() => void) [] = [] 

  constructor(private preferencesService : PreferencesService) {
    this.loadWordList();
  }

  loadWordList(url?: string) : Promise<void> {

    let path;
    if (url) {
      path = url;
    } else {
      path = `assets/words/${this.preferencesService.getPreference(Preference.LANGUAGE)}.txt`
    }

    return fetch(path)
      .then((response) => response.text())
      .then((text) => {
        this.words = text.split(/\r?\n?\s/);
        this.wordListLoaded = true;
        this.notifySubscribers();
      });
  }

  getWords(shuffle?: boolean, wordCount?: number): string[] {

    let data: string[] = this.words.slice();
    let res: string[] = [];

    if (typeof wordCount !== 'undefined') {
      while (res.length < wordCount) {
        res.push(data.splice(Math.floor(Math.random() * data.length), 1)[0]);
      }
    } else {
      res = data;
    }

    return res;
  }

  addListener(listenerFunction: () => void) : void {

    this.listeners.push(listenerFunction);

    if (this.wordListLoaded) {
      listenerFunction();
    }
  }

  notifySubscribers () {
    this.listeners.forEach(listener => listener());
  }
}
