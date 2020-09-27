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
  currentlyLoadingWordMode: WordMode;

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

  private onLanguageFetch(
    language: Language,
    wordMode: WordMode,
    promise: Promise<any>
  ) {
    this.currentlyLoadingLanguage = language;
    this.currentlyLoadingWordMode = wordMode;
    promise.then(() => {
      if (
        this.preferencesService.getPreference(Preference.LANGUAGE) === language
      ) {
        this.currentlyLoadingLanguage = undefined;
        this.currentlyLoadingWordMode = undefined;
      }
    });
  }

  onPreferencesIconClicked() {
    this.showPreferences = !this.showPreferences;
    this.preferencesToggled.emit(this.showPreferences);
    this.openedPreferencesGroup = '';
  }

  onThemeChanged(theme: Theme) {
    const themeChanged =
      theme !== this.preferencesService.getPreference(Preference.THEME);

    if (themeChanged)
      this.preferencesService.setPreference(Preference.THEME, theme);
  }

  onFollowSystemThemeChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.FOLLOW_SYSTEM_THEME,
      (event.target as HTMLInputElement).checked
    );
  }

  onLanguageChanged(language: Language) {
    const setPreference = () =>
      this.preferencesService.setPreference(Preference.LANGUAGE, language);
    const setCustomLanguageLoading = (file: File) => {
      this.currentlyLoadingLanguage = Language.CUSTOM;
      return file;
    };
    const loadFile = (file: File) => this.wordService.loadFile(file);

    const oldLanguage = this.preferencesService.getPreference(
      Preference.LANGUAGE
    );
    const languageChanged = oldLanguage !== language;

    if (languageChanged) {
      if (language === Language.CUSTOM && !this.hasCachedFile()) {
        this.selectFile()
          .then(setCustomLanguageLoading)
          .then(loadFile)
          .then(setPreference);
      } else {
        setPreference();
      }
    } else {
      // Language reselected
      if (language === Language.CUSTOM) {
        this.selectFile()
          .then(setCustomLanguageLoading)
          .then(loadFile)
          .then(setPreference);
      }
    }
  }

  onDefaultWordModeChanged(wordMode: WordMode) {
    const wordModeChanged =
      wordMode !== this.preferencesService.getPreference(Preference.WORD_MODE);
    if (wordModeChanged)
      this.preferencesService.setPreference(Preference.WORD_MODE, wordMode);
  }

  onTextSizeChanged(textSize: TextSize) {
    const textSizeChanged =
      textSize !== this.preferencesService.getPreference(Preference.TEXT_SIZE);
    if (textSizeChanged)
      this.preferencesService.setPreference(Preference.TEXT_SIZE, textSize);
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

  onScrollingAnimationChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.SCROLLING_ANIMATION,
      (event.target as HTMLInputElement).checked
    );
  }

  onIgnoreAccentedCharactersChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.IGNORE_DIACRITICS,
      (event.target as HTMLInputElement).checked
    );
  }

  onIgnoreCasingChanged(event: Event) {
    this.preferencesService.setPreference(
      Preference.IGNORE_CASING,
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

  getCachedFileName() {
    return this.wordService.getCachedFileName()?.trim();
  }

  hasCachedFile() {
    return this.wordService.getCachedFileName()?.trim().length;
  }
}
