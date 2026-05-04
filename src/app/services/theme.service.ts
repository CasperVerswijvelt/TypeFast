import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { PreferencesService } from './preferences.service';
import { Preference, Theme } from '../models/Preference';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private preferences: Map<string, BehaviorSubject<any>>;

  constructor(private preferencesService: PreferencesService) {
    this.preferences = this.preferencesService.getPreferences();

    this.preferences
      .get(Preference.THEME)
      .subscribe(this.onThemePreferenceUpdated.bind(this));
    this.preferences
      .get(Preference.FOLLOW_SYSTEM_THEME)
      .subscribe(this.onFollowSystemPreferenceUpdated.bind(this));

    if (!this.isBrowser) return;

    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener(
        'change',
        this.onSystemThemeUpdated.bind(this),
      );

      // Safari compatibility, it uses deprecated method
    } else if (mediaQueryList.addListener) {
      mediaQueryList.addListener(this.onSystemThemeUpdated.bind(this));
    }
  }

  private onThemePreferenceUpdated(value: any) {
    this.updateTheme(
      this.prefersDark(),
      value,
      this.preferences.get(Preference.FOLLOW_SYSTEM_THEME).value,
    );
  }

  private onFollowSystemPreferenceUpdated(value: any) {
    this.updateTheme(
      this.prefersDark(),
      this.preferences.get(Preference.THEME).value,
      value,
    );
  }

  private onSystemThemeUpdated(event: MediaQueryListEvent) {
    this.updateTheme(
      event.matches,
      this.preferences.get(Preference.THEME).value,
      this.preferences.get(Preference.FOLLOW_SYSTEM_THEME).value,
    );
  }

  private prefersDark(): boolean {
    return this.isBrowser
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
  }

  private updateTheme(
    matchesPreferkDark: boolean,
    themePreference: Theme,
    followSystemThemePreference: boolean,
  ) {
    this.setTheme(
      followSystemThemePreference
        ? matchesPreferkDark
          ? Theme.DARK
          : themePreference
        : themePreference,
    );
  }

  setTheme(theme: Theme): void {
    if (this.document.body) {
      this.document.body.className = `theme--${theme as string}`;
    }
  }
}
