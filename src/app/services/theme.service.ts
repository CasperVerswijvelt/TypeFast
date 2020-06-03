import { Injectable } from '@angular/core';
import { PreferencesService } from './preferences.service';
import { Preference, Theme } from '../models/Preference';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private preferences: Map<string, BehaviorSubject<any>>;

  constructor(private preferencesService: PreferencesService) {
    let mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    this.preferences = preferencesService.getPreferences();

    this.preferences
      .get(Preference.THEME)
      .subscribe(this.onThemePreferenceUpdated.bind(this));
    this.preferences
      .get(Preference.FOLLOW_SYSTEM_THEME)
      .subscribe(this.onFollowSystemPreferenceUpdated.bind(this));

    // Listen to localstorage changes
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener(
        'change',
        this.onSystemThemeUpdated.bind(this)
      );

      // Safari compatibility, it uses deprecated method
    } else if (mediaQueryList.addListener) {
      mediaQueryList.addListener(this.onSystemThemeUpdated.bind(this));
    }
  }

  private onThemePreferenceUpdated(value: any) {
    this.updateTheme(
      window.matchMedia('(prefers-color-scheme: dark)').matches,
      value,
      this.preferences.get(Preference.FOLLOW_SYSTEM_THEME).value
    );
  }

  private onFollowSystemPreferenceUpdated(value: any) {
    this.updateTheme(
      window.matchMedia('(prefers-color-scheme: dark)').matches,
      this.preferences.get(Preference.THEME).value,
      value
    );
  }

  private onSystemThemeUpdated(event: MediaQueryListEvent) {
    this.updateTheme(
      event.matches,
      this.preferences.get(Preference.THEME).value,
      this.preferences.get(Preference.FOLLOW_SYSTEM_THEME).value
    );
  }

  private updateTheme(
    matchesPreferkDark: boolean,
    themePreference: Theme,
    followSystemThemePreference: boolean
  ) {
    this.setTheme(
      followSystemThemePreference
        ? matchesPreferkDark
          ? Theme.DARK
          : themePreference
        : themePreference
    );
  }

  setTheme(theme: Theme) {
    document.body.className = `theme--${theme as string}`;
  }
}
