import { Injectable } from '@angular/core';
import { WordService } from './word.service';
import { Preference, Preferences, Language, Theme, WordMode, TextSize } from '../models/Preference';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private defaults: Preferences = {
    theme: Theme.LIGHT,
    word_language: Language.ENGLISH,
    follow_system_theme: false,
    default_word_mode: WordMode.WORDS,
    reverse_scroll: false,
    default_test_duration: 60,
    text_size: TextSize.MEDIUM,
  };

  private preferencesSubjects = new Map<string, BehaviorSubject<any>>();

  constructor() {
    addEventListener('storage', this.onStorage.bind(this), false);

    this.retrievePreferences();
  }

  private retrievePreferences() {
    try {
      // Set default preferences
      for (let defaultPreference in this.defaults) {
        this.preferencesSubjects.set(defaultPreference, new BehaviorSubject(this.defaults[defaultPreference]));
      }

      let preferences = JSON.parse(localStorage.getItem('preferences'));
      if (typeof preferences === 'undefined') throw null;

      for (let preference in preferences) {
        this.preferencesSubjects.get(preference).next(preferences[preference]);
      }
    } catch (e) {}
  }

  getPreferences(): Map<string, BehaviorSubject<any>> {
    return new Map(this.preferencesSubjects);
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
    this.preferencesSubjects.get(key).next(value);
  }

  clearPreferences() {
    if (localStorage.getItem('preferences') !== null) {
      localStorage.removeItem('preferences');
      for (let defaultPreference in this.defaults) {
        this.preferencesSubjects.get(defaultPreference).next(this.defaults[defaultPreference]);
      }
    }
  }

  private onStorage(event: StorageEvent) {
    if (event.key == 'preferences') {
      try {
        let oldObj: Preferences = JSON.parse(event.oldValue);
        let newObj: Preferences = JSON.parse(event.newValue);

        Object.keys(this.defaults).forEach((key) => {
          if (oldObj[key] !== newObj[key]) {
            this.preferencesSubjects.get(key).next(newObj[key]);
          }
        });
      } catch (e) {}
    }
  }
}
