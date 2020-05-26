import { Injectable } from '@angular/core';
import { WordService } from './word.service';
import { Preference, Preferences, Language, Theme } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {

  private listeners : ((updatedPreference : Preference, value:any) => void)[] = [];

  private defaults: Preferences = {
    theme: Theme.LIGHT,
    word_language: Language.ENGLISH,
  };

  constructor() {
    addEventListener('storage', this.onStorage.bind(this), false);
  }

  getPreference(key: Preference): any {
    try {
      let preference = JSON.parse(localStorage.getItem('preferences'))[key];
      if (typeof preference === 'undefined') throw null;
      return preference;
    } catch (e) {
      return this.defaults[key];
    }
  }

  setPreference(key: Preference, value: any) {
    // Retrieve preferences object
    let pref: Preferences;

    try {
      pref = JSON.parse(localStorage.getItem('preferences'));
      if (pref == null || typeof pref === 'undefined') throw null;
    } catch (e) {
      pref = {};
    }

    pref[key as string] = value;

    localStorage.setItem('preferences', JSON.stringify(pref));
    this.notifySubscribers(key, value);
  }

  addListener(listener : (updatedPreference : Preference, peferenceValue : any) => void) {
    if (listener) {
      this.listeners.push(listener);
    }
  }

  private onStorage(event: StorageEvent) {
    if (event.key == "preferences") {
      try {
        let oldObj : Preferences = JSON.parse(event.oldValue);
        let newObj : Preferences = JSON.parse(event.newValue);

        Object.keys(this.defaults).forEach(key => {
          if(oldObj[key] !== newObj[key]) {
            this.notifySubscribers(key as Preference, newObj[key]);
          }
        })

      } catch (e) {
      }
    }
  }

  private notifySubscribers(updatedPreference : Preference, value:any) {
    this.listeners.forEach(listener => {
      listener(updatedPreference, value);
    });
  }
}
