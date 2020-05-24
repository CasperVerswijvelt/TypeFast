import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PreferencesService } from '../preferences.service';
import { Preference, Language } from '../Preference';
import { WordService } from '../word.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
  @Output() toggled = new EventEmitter<boolean>();

  showPreferences = false;
  Language = Language;

  useDarkMode: boolean;
  language: Language;

  constructor(
    private preferencesService: PreferencesService,
    private wordService: WordService
  ) {
    this.useDarkMode = preferencesService.getPreference(Preference.DARK_MODE);
    this.language = preferencesService.getPreference(Preference.LANGUAGE);
  }

  ngOnInit(): void {}

  onPreferencesIconClicked() {
    this.togglePreferences();
  }

  togglePreferences() {
    this.showPreferences = !this.showPreferences;
    this.toggled.emit(this.showPreferences);
  }

  onDarkModeChanged() {
    this.preferencesService.setPreference(
      Preference.DARK_MODE,
      this.useDarkMode
    );
  }

  onLanguageChanged() {
    this.preferencesService.setPreference(Preference.LANGUAGE, this.language);
    this.wordService.loadWordList();
  }

  getFlagForLangauge(language: Language): string {
    switch (language) {
      case Language.DUTCH:
        return '🇳🇱';
      case Language.ENGLISH:
        return '🇬🇧';
      case Language.ITALIAN:
        return '🇮🇹';
      case Language.DUTCH:
        return '🇧🇪';
      case Language.HINDI:
        return '🇮🇳';
      case Language.HUNGARIAN:
        return '🇭🇺';
      case Language.JAPANESE:
        return '🇯🇵';
      case Language.KOREAN:
        return '🇰🇷';
      case Language.CHINESE:
        return '🇨🇳';
      case Language.RUSSIAN:
        return '🇷🇺';
      case Language.SPANISH:
        return '🇪🇸';
      case Language.PORTUGUESE:
        return '🇵🇹';
      case Language.FRENCH:
        return '🇫🇷';
      case Language.GERMAN:
        return '🇩🇪';
      case Language.ARABIC:
        return '🇸🇦';
      default:
        return '🏳️';
    }
  }
}
