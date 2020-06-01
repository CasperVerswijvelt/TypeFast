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

  private onThemePreferenceUpdated(value: any) {
    this.setTheme(value);
  }

  private onFollowSystemPreferenceUpdated(value: any) {
    this.setTheme(
      value ? Theme.DARK : this.preferences.get(Preference.THEME).value
    );
  }

  private onSystemThemeUpdated(event: MediaQueryListEvent) {
    this.setTheme(
      event.matches ? Theme.DARK : this.preferences.get(Preference.THEME).value
    );
  }

  setTheme(theme: Theme) {
    document.body.className = `theme--${theme as string}`;
  }
}
