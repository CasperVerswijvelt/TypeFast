import { Injectable } from '@angular/core';
import { WordService } from './word.service';
import { Preference, Preferences, Language } from './Preference';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private defaults: Preferences = {
    dark_mode: true,
    word_language: Language.ENGLISH,
    shuffle_words: true
  };

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
  }
}
