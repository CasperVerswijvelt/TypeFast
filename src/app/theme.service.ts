import { Injectable } from '@angular/core';
import { Theme } from 'src/Theme';
import { PreferencesService } from './preferences.service';
import { Preference } from './Preference';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor(private preferencesService: PreferencesService) {
    this.setTheme(
      preferencesService.getPreference(Preference.DARK_MODE)
        ? Theme.DARK
        : Theme.LIGHT
    );
  }

  setTheme(theme?: Theme) {
    let _theme: Theme = theme
      ? theme
      : this.preferencesService.getPreference(Preference.DARK_MODE)
      ? Theme.DARK
      : Theme.LIGHT;
    document.body.className = `theme--${_theme as string}`;
  }
}
