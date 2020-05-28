import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PreferencesService } from '../../services/preferences.service';
import { Preference, Language, Theme, WordMode } from '../../models/Preference';
import { WordService } from '../../services/word.service';
import { ThemeService } from '../../services/theme.service';
import { KeyValue } from '@angular/common';

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
  WordMode = WordMode;
  

  followSystemTheme: boolean;
  language: Language;
  theme : Theme;
  defaultWordMode: WordMode;

  openedPreferencesGroup : string;
  currentlyLoadingLanguage : Language;

  originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
  }

  constructor(
    private preferencesService: PreferencesService,
    private wordService: WordService,
    private themeService : ThemeService
  ) {
    this.theme = preferencesService.getPreference(Preference.THEME);
    this.language = preferencesService.getPreference(Preference.LANGUAGE);
    this.followSystemTheme = preferencesService.getPreference(Preference.FOLLOW_SYSTEM_THEME);
    this.defaultWordMode = preferencesService.getPreference(Preference.DEFAULT_WORD_MODE);

    preferencesService.addListener(this.onPreferenceUpdated.bind(this));
    wordService.addLanguageFetchListener(this.onLanguageFetch.bind(this));
  }

  ngOnInit(): void {}

  private onPreferenceUpdated(
    updatedPreference: Preference,
    preferenceValue: any
  ) {
    if (updatedPreference === Preference.THEME) {
      this.theme = preferenceValue;
    } else
    if (updatedPreference === Preference.LANGUAGE) {
      this.language = preferenceValue;
    } else
    if (updatedPreference === Preference.FOLLOW_SYSTEM_THEME) {
      this.followSystemTheme = preferenceValue;
    } else
    if (updatedPreference === Preference.DEFAULT_WORD_MODE) {
      this.defaultWordMode = preferenceValue;
    }
  }

  private onLanguageFetch(language : Language, promise : Promise<any>) {
    this.currentlyLoadingLanguage = language;
    promise.then(() => this.currentlyLoadingLanguage = undefined)
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

  onDefaultWordModeChanged() {
    this.preferencesService.setPreference(Preference.DEFAULT_WORD_MODE, this.defaultWordMode);
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
      case Language.PROGRAMMING:
        return 'dev';
      default:
        return 'unknown';
    }
  }

  togglePreferencesGroup(group : string) {

    this.openedPreferencesGroup = this.openedPreferencesGroup === group ? "" : group;
  }
}
