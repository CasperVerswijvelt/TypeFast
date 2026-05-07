import {
  Component,
  ElementRef,
  NgZone,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PreferencesService } from '../../services/preferences.service';
import {
  Preference,
  Language,
  Theme,
  WordMode,
  TextSize,
} from '../../models/Preference';
import { WordService } from '../../services/word.service';
import { LanguageService } from 'src/app/services/language.service';
import { DOCUMENT, NgClass, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PopperDirective } from '../../directives/popper.directive';
import { PreferenceGroupComponent } from '../shared/preference-group/preference-group.component';
import { PreferenceToggleComponent } from '../shared/preference-toggle/preference-toggle.component';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  imports: [
    FormsModule,
    NgClass,
    PopperDirective,
    KeyValuePipe,
    PreferenceGroupComponent,
    PreferenceToggleComponent,
  ],
})
export class PreferencesComponent {
  readonly preferencesToggled = output<boolean>();

  private readonly preferencesDialogRef =
    viewChild.required<ElementRef<HTMLDialogElement>>('preferencesDialog');

  readonly prefs = inject(PreferencesService);
  private readonly wordService = inject(WordService);
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);

  Language = Language;
  Theme = Theme;
  WordMode = WordMode;
  TextSize = TextSize;
  Preference = Preference;

  openedPreferencesGroup = '';
  // Signals so writes mark the view dirty (the AppComponent is OnPush, so a
  // plain field write wouldn't trigger CD). The fetch that resolves these
  // is started inside a signal effect — so its .then() runs outside NgZone,
  // and we re-enter the zone explicitly so the dirty mark gets ticked.
  readonly currentlyLoadingLanguage = signal<Language | undefined>(undefined);
  readonly currentlyLoadingWordMode = signal<WordMode | undefined>(undefined);

  originalOrder = (): number => 0;

  constructor() {
    this.wordService.languageFetchStarted
      .pipe(takeUntilDestroyed())
      .subscribe(({ language, wordMode, promise }) => {
        this.ngZone.run(() => {
          this.currentlyLoadingLanguage.set(language);
          this.currentlyLoadingWordMode.set(wordMode);
        });
        promise.then(() => {
          this.ngZone.run(() => {
            if (this.prefs.language() === language) {
              this.currentlyLoadingLanguage.set(undefined);
              this.currentlyLoadingWordMode.set(undefined);
            }
          });
        });
      });
  }

  onPreferencesIconClicked(): void {
    const dialog = this.preferencesDialogRef().nativeElement;
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
    this.preferencesDialogRef().nativeElement.classList.remove(
      'preferences-dialog--ready',
    );
  }

  onThemeChanged(theme: Theme): void {
    if (theme !== this.prefs.theme()) {
      this.prefs.setPreference(Preference.THEME, theme);
    }
  }

  onLanguageChanged(language: Language): void {
    const setPreference = () =>
      this.prefs.setPreference(Preference.LANGUAGE, language);
    const setCustomLanguageLoading = (file: File) => {
      this.currentlyLoadingLanguage.set(Language.CUSTOM);
      return file;
    };
    const loadFile = (file: File) => this.wordService.loadFile(file);

    const languageChanged = this.prefs.language() !== language;

    const handleCancel = () => {
      this.currentlyLoadingLanguage.set(undefined);
    };

    if (languageChanged) {
      if (language === Language.CUSTOM && !this.hasCachedFile()) {
        this.selectFile()
          .then(setCustomLanguageLoading)
          .then(loadFile)
          .then(setPreference)
          .catch(handleCancel);
      } else {
        setPreference();
      }
    } else {
      // Language reselected
      if (language === Language.CUSTOM) {
        this.selectFile()
          .then(setCustomLanguageLoading)
          .then(loadFile)
          .then(setPreference)
          .catch(handleCancel);
      }
    }
  }

  onDefaultWordModeChanged(wordMode: WordMode): void {
    if (wordMode !== this.prefs.wordMode()) {
      this.prefs.setPreference(Preference.WORD_MODE, wordMode);
    }
  }

  onTextSizeChanged(textSize: TextSize): void {
    if (textSize !== this.prefs.textSize()) {
      this.prefs.setPreference(Preference.TEXT_SIZE, textSize);
    }
  }

  onClickResetPreferences(): void {
    if (
      confirm(
        "Are you sure you want to reset your preferences? This can't be undone!",
      )
    ) {
      this.prefs.clearPreferences();
    }
  }

  selectFile(): Promise<File> {
    return new Promise((resolve, reject) => {
      const input: HTMLInputElement = this.document.createElement('input');
      input.setAttribute('accept', '.txt');
      input.type = 'file';

      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          resolve(file);
        } else {
          reject(new Error('No file selected'));
        }
      };

      input.oncancel = () => {
        reject(new Error('File selection cancelled'));
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

  getCachedFileName(): string | undefined {
    return this.wordService.getCachedFileName()?.trim();
  }

  hasCachedFile(): boolean {
    return !!this.wordService.getCachedFileName()?.trim().length;
  }
}
