import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PreferencesService } from '../../services/preferences.service';
import {
  Preference,
  Language,
  Theme,
  WordMode,
  TextSize,
} from '../../models/Preference';
import { WordService } from '../../services/word.service';
import { KeyValue } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
  @Output() preferencesToggled = new EventEmitter<boolean>();
  @Output() aboutClicked = new EventEmitter<void>();

  showPreferences = false;
  Language = Language;
  Theme = Theme;
  WordMode = WordMode;
  TextSize = TextSize;
  Preference = Preference;

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
    private wordService: WordService
  ) {
    this.preferences = preferencesService.getPreferences();

    wordService.addLanguageFetchListener(this.onLanguageFetch.bind(this));
  }

  ngOnInit(): void {}

  private onLanguageFetch(language: Language, promise: Promise<any>) {
    this.currentlyLoadingLanguage = language;
    promise.then(() => {
      if (
        this.preferencesService.getPreference(Preference.LANGUAGE) === language
      ) {
        this.currentlyLoadingLanguage = undefined;
      }
    });
  }

  onPreferencesIconClicked() {
    this.showPreferences = !this.showPreferences;
    this.preferencesToggled.emit(this.showPreferences);
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
      (event.target as HTMLInputElement).checked
    );
  }

  onLanguageChanged(event: Event) {
    const language = (event.target as HTMLInputElement).value;

    const setPreference = () =>
      this.preferencesService.setPreference(Preference.LANGUAGE, language);
    const setCustomLanguageLoading = (file: File) => {
      this.currentlyLoadingLanguage = Language.CUSTOM;
      return file;
    };
    const loadFile = (file: File) => this.wordService.loadFile(file);

    if (language === Language.CUSTOM) {
      this.selectFile()
        .then(setCustomLanguageLoading)
        .then(loadFile)
        .then(setPreference);
    } else {
      setPreference();
    }
  }

  onDefaultWordModeChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.WORD_MODE,
      (event.target as HTMLInputElement).value
    );
  }

  onTextSizeChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.TEXT_SIZE,
      (event.target as HTMLInputElement).value
    );
  }

  onReverseScrollChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.REVERSE_SCROLL,
      (event.target as HTMLInputElement).checked
    );
  }

  onSmoothScrollingChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.SMOOTH_SCROLLING,
      (event.target as HTMLInputElement).checked
    );
  }

  onClickAbout() {
    this.aboutClicked.emit();
  }

  onClickResetPreferences() {
    if (
      confirm(
        "Are you sure you want to reset your preferences? This can't be undone!"
      ) == true
    ) {
      this.preferencesService.clearPreferences();
    }
  }

  selectFile() {
    return new Promise((resolve, reject) => {
      const input: HTMLInputElement = document.createElement('input');
      input.setAttribute('accept', '.txt');
      input.type = 'file';

      input.onchange = (e: Event) => {
        resolve((<HTMLInputElement>e.target).files[0]);
      };

      input.click();
    });
  }

  getISOForLangauge(language: Language): string {
    return LanguageService.getLanguageISO(language);
  }

  getNameForLanguage(language: Language): string {
    return this.wordService.getLanguageString(language);
  }

  togglePreferencesGroup(group: string) {
    this.openedPreferencesGroup =
      this.openedPreferencesGroup === group ? '' : group;
  }
}
