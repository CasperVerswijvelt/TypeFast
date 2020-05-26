import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PreferencesService } from '../../services/preferences.service';
import { Preference, Language, Theme } from '../../models/Preference';
import { WordService } from '../../services/word.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
  @Output() toggled = new EventEmitter<boolean>();

  showPreferences = false;
  Language = Language;
  Theme = Theme;
  

  followSystemTheme: boolean;
  language: Language;
  theme : Theme;

  openedPreferencesGroup : string;

  constructor(
    private preferencesService: PreferencesService,
    private wordService: WordService,
    private themeService : ThemeService
  ) {
    this.theme = preferencesService.getPreference(Preference.THEME);
    this.language = preferencesService.getPreference(Preference.LANGUAGE);
    this.followSystemTheme = preferencesService.getPreference(Preference.FOLLOW_SYSTEM_THEME);

    preferencesService.addListener(this.onPreferenceUpdated.bind(this));
  }

  ngOnInit(): void {}

  private onPreferenceUpdated(
    updatedPreference: Preference,
    preferenceValue: any
  ) {
    if (updatedPreference === Preference.THEME) {
      this.theme = preferenceValue;
    }
    if (updatedPreference === Preference.LANGUAGE) {
      this.language = preferenceValue;
    }
    if (updatedPreference === Preference.FOLLOW_SYSTEM_THEME) {
      this.followSystemTheme = preferenceValue;
    }
  }

  onPreferencesIconClicked() {
    this.togglePreferences();
  }

  togglePreferences() {
    this.showPreferences = !this.showPreferences;
    this.toggled.emit(this.showPreferences);
    this.openedPreferencesGroup = "";
  }

  onThemeChanged() {
    this.preferencesService.setPreference(
      Preference.THEME,
      this.theme
    );
    this.preferencesService.setPreference(
      Preference.FOLLOW_SYSTEM_THEME,
      this.followSystemTheme
    );
  }

  onLanguageChanged() {
    this.preferencesService.setPreference(Preference.LANGUAGE, this.language);
  }

  onClickLoadCustomList() {
    var input: HTMLInputElement = document.createElement('input');
    input.setAttribute('accept', '.txt');
    input.type = 'file';

    input.onchange = input.onchange = (e: Event) => {
      var file = (<HTMLInputElement>e.target).files[0];
      this.wordService.loadFile(file);
    };

    input.click();
  }

  getISOForLangauge(language: Language): string {
    switch (language) {
      case Language.DUTCH:
        return 'nl';
      case Language.ENGLISH:
        return 'gb';
      case Language.ITALIAN:
        return 'it';
      case Language.DUTCH:
        return 'be';
      case Language.HINDI:
        return 'in';
      case Language.HUNGARIAN:
        return 'hu';
      case Language.JAPANESE:
        return 'jp';
      case Language.KOREAN:
        return 'kr';
      case Language.CHINESE:
        return 'cn';
      case Language.RUSSIAN:
        return 'ru';
      case Language.SPANISH:
        return 'es';
      case Language.PORTUGUESE:
        return 'pt';
      case Language.FRENCH:
        return 'fr';
      case Language.GERMAN:
        return 'de';
      case Language.ARABIC:
        return 'sa';
      default:
        return '🏳️';
    }
  }

  togglePreferencesGroup(group : string) {

    this.openedPreferencesGroup = this.openedPreferencesGroup === group ? "" : group;
  }
}
