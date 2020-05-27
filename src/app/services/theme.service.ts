import { Injectable } from '@angular/core';
import { PreferencesService } from './preferences.service';
import { Preference, Theme } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor(private preferencesService: PreferencesService) {
    this.setTheme();
    preferencesService.addListener(this.onPreferenceUpdated.bind(this));

    let mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    // To make safari work
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener(
        'change',
        this.onSystemThemeUpdated.bind(this)
      );
    } else if (mediaQueryList.addListener) {
      mediaQueryList.addListener(this.onSystemThemeUpdated.bind(this));
    }
  }

  private onPreferenceUpdated(
    updatedPreference: Preference,
    preferenceValue: any
  ) {
    if (updatedPreference === Preference.THEME) {
      this.setTheme(preferenceValue as Theme);
    } else if (updatedPreference === Preference.FOLLOW_SYSTEM_THEME) {
      this.setTheme();
    }
  }

  private onSystemThemeUpdated(event: MediaQueryListEvent) {
    this.setTheme(
      event.matches
        ? Theme.DARK
        : this.preferencesService.getPreference(Preference.THEME)
    );
  }

  setTheme(theme?: Theme) {
    let _theme: Theme = theme
      ? theme
      : this.preferencesService.getPreference(
          Preference.FOLLOW_SYSTEM_THEME
        ) === true &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ? Theme.DARK
      : this.preferencesService.getPreference(Preference.THEME);
    document.body.className = `theme--${_theme as string}`;
  }
}
