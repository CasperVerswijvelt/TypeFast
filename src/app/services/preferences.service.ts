import { Injectable } from '@angular/core';
import {
  Preference,
  Preferences,
  Language,
  Theme,
  WordMode,
  TextSize,
} from '../models/Preference';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private defaults: Preferences = {
    [Preference.THEME]: Theme.LIGHT,
    [Preference.LANGUAGE]: Language.ENGLISH_AMERICAN,
    [Preference.FOLLOW_SYSTEM_THEME]: false,
    [Preference.WORD_MODE]: WordMode.WORDS,
    [Preference.REVERSE_SCROLL]: false,
    [Preference.DEFAULT_TEST_DURATION]: 60,
    [Preference.TEXT_SIZE]: TextSize.MEDIUM,
    [Preference.SMOOTH_SCROLLING]: true,
    [Preference.SCROLLING_ANIMATION]: true,
    [Preference.IGNORE_DIACRITICS]: false,
    [Preference.IGNORE_CASING]: false,
  };

  private preferenceTypes: any = {
    [Preference.THEME]: Theme,
    [Preference.LANGUAGE]: Language,
    [Preference.FOLLOW_SYSTEM_THEME]: 'boolean',
    [Preference.WORD_MODE]: WordMode,
    [Preference.REVERSE_SCROLL]: 'boolean',
    [Preference.DEFAULT_TEST_DURATION]: 'number',
    [Preference.TEXT_SIZE]: TextSize,
    [Preference.SMOOTH_SCROLLING]: 'boolean',
    [Preference.SCROLLING_ANIMATION]: 'boolean',
    [Preference.IGNORE_DIACRITICS]: 'boolean',
    [Preference.IGNORE_CASING]: 'boolean',
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
        this.preferencesSubjects.set(
          defaultPreference,
          new BehaviorSubject(this.defaults[defaultPreference])
        );
      }

      let preferences = JSON.parse(localStorage.getItem('preferences'));
      if (typeof preferences === 'undefined') throw null;

      for (let preference in preferences) {
        const preferenceKey = preference;
        const preferenceValue = preferences[preference];

        if (
          this.validatePreferenceType(preferenceKey, preferenceValue) &&
          !this.isTemporaryPreference(preferenceKey, preferenceValue)
        )
          this.preferencesSubjects.get(preference)?.next(preferenceValue);
      }
    } catch (e) {}
  }

  private validatePreferenceType(key: string, value: any) {
    const type = this.preferenceTypes[key];

    return (
      typeof type === 'undefined' ||
      (typeof type === 'string'
        ? typeof value === type
        : Object.values(type).includes(value))
    );
  }

  private isTemporaryPreference(key: string, value: any) {
    return key === Preference.LANGUAGE && value == Language.CUSTOM;
  }

  getPreferences(): Map<string, BehaviorSubject<any>> {
    return new Map(this.preferencesSubjects);
  }

  getPreference(key: Preference): any {
    let subject = this.preferencesSubjects.get(key);
    return subject?.value;
  }

  setPreference(key: Preference, value: any) {
    if (!this.validatePreferenceType(key, value)) return;

    if (!this.isTemporaryPreference(key, value)) {
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

    this.preferencesSubjects.get(key).next(value);
  }

  clearPreferences() {
    if (localStorage.getItem('preferences') !== null) {
      localStorage.removeItem('preferences');
      for (let defaultPreference in this.defaults) {
        this.preferencesSubjects
          .get(defaultPreference)
          .next(this.defaults[defaultPreference]);
      }
    }
  }

  private onStorage(event: StorageEvent) {
    if (event.key == 'preferences') {
      try {
        let oldObj: Preferences = JSON.parse(event.oldValue);
        let newObj: Preferences = JSON.parse(event.newValue);

        Object.keys(this.defaults).forEach((key) => {
          const newVal = newObj[key];
          if (
            oldObj[key] !== newVal &&
            this.validatePreferenceType(key, newVal) &&
            !this.isTemporaryPreference(key, newVal)
          ) {
            this.preferencesSubjects.get(key).next(newObj[key]);
          }
        });
      } catch (e) {}
    }
  }
}
