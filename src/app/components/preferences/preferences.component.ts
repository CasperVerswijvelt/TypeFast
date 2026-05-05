import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { PreferencesService } from '../../services/preferences.service';
import {
  Preference,
  Language,
  Theme,
  WordMode,
  TextSize,
} from '../../models/Preference';
import { WordService } from '../../services/word.service';
import { BehaviorSubject } from 'rxjs';
import { LanguageService } from 'src/app/services/language.service';
import { NgClass, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DISCORD_URL, GITHUB_URL } from '../../constants';
import { PopperDirective } from '../../directives/popper.directive';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  imports: [FormsModule, NgClass, PopperDirective, KeyValuePipe],
})
export class PreferencesComponent implements OnInit {
  @Output() preferencesToggled = new EventEmitter<boolean>();

  @ViewChild('preferencesDialog')
  private preferencesDialogRef!: ElementRef<HTMLDialogElement>;

  Language = Language;
  Theme = Theme;
  WordMode = WordMode;
  TextSize = TextSize;
  Preference = Preference;
  readonly discordUrl = DISCORD_URL;
  readonly githubUrl = GITHUB_URL;

  preferences: Map<string, BehaviorSubject<unknown>>;

  openedPreferencesGroup: string;
  currentlyLoadingLanguage: Language;
  currentlyLoadingWordMode: WordMode;

  originalOrder = (): number => {
    return 0;
  };

  constructor(
    private preferencesService: PreferencesService,
    private wordService: WordService,
  ) {
    this.preferences = preferencesService.getPreferences();

    wordService.addLanguageFetchListener(this.onLanguageFetch.bind(this));
  }

  ngOnInit(): void {
    // Empty
  }

  private onLanguageFetch(
    language: Language,
    wordMode: WordMode,
    promise: Promise<void>,
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

  onPreferencesIconClicked(): void {
    const dialog = this.preferencesDialogRef.nativeElement;
    if (dialog.open) {
      dialog.close();
    } else {
      this.openedPreferencesGroup = '';
      dialog.showModal();
      this.preferencesToggled.emit(true);
      // Group-collapse transitions are suppressed until the dialog's
      // opening fade finishes; otherwise a quick click on a group title
      // would visually compose with the parent's still-fading opacity.
      requestAnimationFrame(() => {
        setTimeout(
          () => dialog.classList.add('preferences-dialog--ready'),
          250,
        );
      });
    }
  }

  // Native <dialog> doesn't auto-close on backdrop click; handle it
  // ourselves by checking whether the click target is the dialog itself.
  onDialogBackdropClick(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target === dialog) dialog.close();
  }

  // Fires for ESC, backdrop click, and explicit close() calls.
  onPreferencesDialogClosed(): void {
    this.openedPreferencesGroup = '';
    this.preferencesToggled.emit(false);
    this.preferencesDialogRef.nativeElement.classList.remove(
      'preferences-dialog--ready',
    );
  }

  onThemeChanged(theme: Theme): void {
    const themeChanged =
      theme !== this.preferencesService.getPreference(Preference.THEME);

    if (themeChanged)
      this.preferencesService.setPreference(Preference.THEME, theme);
  }

  onFollowSystemThemeChanged(event: Event): void {
    this.preferencesService.setPreference(
      Preference.FOLLOW_SYSTEM_THEME,
      (event.target as HTMLInputElement).checked,
    );
  }

  onLanguageChanged(language: Language): void {
    const setPreference = () =>
      this.preferencesService.setPreference(Preference.LANGUAGE, language);
    const setCustomLanguageLoading = (file: File) => {
      this.currentlyLoadingLanguage = Language.CUSTOM;
      return file;
    };
    const loadFile = (file: File) => this.wordService.loadFile(file);

    const oldLanguage = this.preferencesService.getPreference(
      Preference.LANGUAGE,
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

  onDefaultWordModeChanged(wordMode: WordMode): void {
    const wordModeChanged =
      wordMode !== this.preferencesService.getPreference(Preference.WORD_MODE);
    if (wordModeChanged)
      this.preferencesService.setPreference(Preference.WORD_MODE, wordMode);
  }

  onTextSizeChanged(textSize: TextSize): void {
    const textSizeChanged =
      textSize !== this.preferencesService.getPreference(Preference.TEXT_SIZE);
    if (textSizeChanged)
      this.preferencesService.setPreference(Preference.TEXT_SIZE, textSize);
  }

  onReverseScrollChanged(event: Event): void {
    this.preferencesService.setPreference(
      Preference.REVERSE_SCROLL,
      (event.target as HTMLInputElement).checked,
    );
  }

  onSmoothScrollingChanged(event: Event): void {
    this.preferencesService.setPreference(
      Preference.SMOOTH_SCROLLING,
      (event.target as HTMLInputElement).checked,
    );
  }

  onScrollingAnimationChanged(event: Event): void {
    this.preferencesService.setPreference(
      Preference.SCROLLING_ANIMATION,
      (event.target as HTMLInputElement).checked,
    );
  }

  onIgnoreAccentedCharactersChanged(event: Event): void {
    this.preferencesService.setPreference(
      Preference.IGNORE_DIACRITICS,
      (event.target as HTMLInputElement).checked,
    );
  }

  onIgnoreCasingChanged(event: Event): void {
    this.preferencesService.setPreference(
      Preference.IGNORE_CASING,
      (event.target as HTMLInputElement).checked,
    );
  }

  onHideTimerChanged(event: Event): void {
    this.preferencesService.setPreference(
      Preference.HIDE_TIMER,
      (event.target as HTMLInputElement).checked,
    );
  }

  onHideLiveStatsChanged(event: Event): void {
    this.preferencesService.setPreference(
      Preference.HIDE_LIVE_STATS,
      (event.target as HTMLInputElement).checked,
    );
  }

  onClickResetPreferences(): void {
    if (
      confirm(
        "Are you sure you want to reset your preferences? This can't be undone!",
      ) == true
    ) {
      this.preferencesService.clearPreferences();
    }
  }

  selectFile(): Promise<File> {
    return new Promise((resolve, _reject) => {
      const input: HTMLInputElement = document.createElement('input');
      input.setAttribute('accept', '.txt');
      input.type = 'file';

      input.onchange = (e: Event) => {
        resolve((e.target as HTMLInputElement).files[0]);
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

  togglePreferencesGroup(group: string): void {
    this.openedPreferencesGroup =
      this.openedPreferencesGroup === group ? '' : group;
  }

  getCachedFileName(): string {
    return this.wordService.getCachedFileName()?.trim();
  }

  hasCachedFile(): boolean {
    return !!this.wordService.getCachedFileName()?.trim().length;
  }
}
