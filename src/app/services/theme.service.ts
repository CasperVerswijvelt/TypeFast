import { Injectable } from '@angular/core';
import { Theme } from 'src/app/models/Theme';
import { PreferencesService } from './preferences.service';
import { Preference } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor(private preferencesService: PreferencesService) {
    this.setTheme(
      preferencesService.getPreference(Preference.THEME)
        ? Theme.DARK
        : Theme.LIGHT
    );
    preferencesService.addListener(this.onPreferenceUpdated.bind(this))
  }

  private onPreferenceUpdated(updatedPreference : Preference, preferenceValue: any) {
    if (updatedPreference === Preference.THEME) {
      this.setTheme(preferenceValue as Theme);
    }
  }

  setTheme(theme?: Theme) {
    let _theme: Theme = theme
      ? theme
      : this.preferencesService.getPreference(Preference.THEME)
      ? Theme.DARK
      : Theme.LIGHT;
    document.body.className = `theme--${_theme as string}`;
  }
}
