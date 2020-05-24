import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PreferencesService } from '../preferences.service';
import { Preference, Language } from '../Preference';
import { WordService } from '../word.service';
import { ThemeService } from '../theme.service';

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
  shuffleWords: boolean;
  language: Language;

  constructor(
    private preferencesService: PreferencesService,
    private wordService: WordService,
    private themeService: ThemeService
  ) {
    this.useDarkMode = preferencesService.getPreference(Preference.DARK_MODE);
    this.language = preferencesService.getPreference(Preference.LANGUAGE);
    this.shuffleWords = preferencesService.getPreference(Preference.SHUFFLE_WORDS);
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
    this.themeService.setTheme();
  }

  onShuffleWordsChanged() {
    this.preferencesService.setPreference(
      Preference.SHUFFLE_WORDS,
      this.shuffleWords
    );
    this.wordService.reprocessWordList();
  }

  onLanguageChanged() {
    this.preferencesService.setPreference(Preference.LANGUAGE, this.language);
    this.wordService.reloadWordList();
  }

  onClickLoadCustomList() {
    var input: HTMLInputElement = document.createElement('input');
    input.setAttribute("accept", ".txt");
    input.type = 'file';

    input.onchange = input.onchange = (e: Event) => {
      var file = (<HTMLInputElement>e.target).files[0];
      this.wordService.loadWordListLocal(file);
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
}
