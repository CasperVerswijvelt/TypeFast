import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PreferencesService } from '../../services/preferences.service';
import { Preference, Language, Theme, WordMode } from '../../models/Preference';
import { WordService } from '../../services/word.service';
import { ThemeService } from '../../services/theme.service';
import { KeyValue } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

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

  preferences: Map<string, BehaviorSubject<any>>;

  openedPreferencesGroup: string;
  currentlyLoadingLanguage: Language;

  originalOrder = (
    a: KeyValue<number, string>,
    b: KeyValue<number, string>
  ): number => {
    return 0;
  };

  constructor(
    private preferencesService: PreferencesService,
    private wordService: WordService) {
    this.preferences = preferencesService.getPreferences();

    wordService.addLanguageFetchListener(this.onLanguageFetch.bind(this));
  }

  ngOnInit(): void {}

  private onLanguageFetch(language: Language, promise: Promise<any>) {
    this.currentlyLoadingLanguage = language;
    promise.then(() => (this.currentlyLoadingLanguage = undefined));
  }

  onPreferencesIconClicked() {
    this.togglePreferences();
  }

  togglePreferences() {
    this.showPreferences = !this.showPreferences;
    this.toggled.emit(this.showPreferences);
    this.openedPreferencesGroup = '';
  }

  onThemeChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.THEME,
      (event.target as HTMLInputElement).value
    );
  }

  onFollowSystemThemeChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.FOLLOW_SYSTEM_THEME,
      (event.target as HTMLInputElement).value
    );
  }

  onLanguageChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.LANGUAGE,
      (event.target as HTMLInputElement).value
    );
  }

  onDefaultWordModeChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.DEFAULT_WORD_MODE,
      (event.target as HTMLInputElement).value
    );
  }

  onReverseScrollChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.REVERSE_SCROLL,
      (event.target as HTMLInputElement).checked
    );
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

  togglePreferencesGroup(group: string) {
    this.openedPreferencesGroup =
      this.openedPreferencesGroup === group ? '' : group;
  }
}
