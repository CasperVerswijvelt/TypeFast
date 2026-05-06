import {
  DestroyRef,
  Injectable,
  Signal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { LanguageService } from './language.service';
import { PreferencesService } from './preferences.service';
import { WordService } from './word.service';
import { Preference, Language } from '../models/Preference';
import { TestResults } from '../models/TestResults';
import { calculateStats, emptyResults } from './test-stats';
import { nextDurationDown, nextDurationUp } from './test-duration';

// Refill threshold: when fewer than this many words remain ahead of the
// cursor, pull a new chunk from the word service.
const WORD_LIST_LOOKAHEAD = 20;

@Injectable({ providedIn: 'root' })
export class TyperStateService {
  private readonly prefs = inject(PreferencesService);
  private readonly wordService = inject(WordService);
  private readonly destroyRef = inject(DestroyRef);

  // Loaded word-list metadata. Distinct from prefs.language() because there
  // is a window during a language switch where the preference has flipped
  // but the new word list hasn't finished loading; scoring needs the
  // language of the word list actually in front of the user.
  private readonly loadedLanguage = signal<Language | undefined>(undefined);

  // Test state — readonly to consumers, mutated only via the methods below.
  private readonly _testTime = signal(60);
  readonly testTime: Signal<number> = this._testTime.asReadonly();

  private readonly _testTimeLeft = signal(60);
  readonly testTimeLeft: Signal<number> = this._testTimeLeft.asReadonly();

  private readonly _testStarted = signal(false);
  readonly testStarted: Signal<boolean> = this._testStarted.asReadonly();

  private readonly _hasCompletedFirstTest = signal(false);
  readonly hasCompletedFirstTest: Signal<boolean> =
    this._hasCompletedFirstTest.asReadonly();

  readonly running = signal(false);

  private readonly _results = signal<TestResults>(emptyResults());
  readonly results: Signal<TestResults> = this._results.asReadonly();
  readonly stats = computed(() => calculateStats(this._results()));

  private readonly _currentIndex = signal(0);
  readonly currentIndex: Signal<number> = this._currentIndex.asReadonly();

  private readonly _words = signal<string[]>(['Loading...']);
  readonly words: Signal<string[]> = this._words.asReadonly();

  readonly testIsRunning = computed(
    () => this._testStarted() && this._testTimeLeft() > 0,
  );
  readonly testIsCompleted = computed(
    () => this._testStarted() && this._testTimeLeft() === 0,
  );

  // Notifies the view layer when the test ends so it can disable the input
  // and shift focus to the dummy element. (Side-effects on the DOM stay in
  // the component; the service only emits a coordination signal.)
  private readonly testEndedSubject = new Subject<void>();
  readonly testEnded$ = this.testEndedSubject.asObservable();

  private secondTimer: Subscription | undefined;
  private focusFn: (() => void) | null = null;

  constructor() {
    // Mirror the preference into the service. While the test isn't running
    // the visible time tracks the configured duration; once running the
    // user can't change it (the +/- buttons are hidden in the template).
    effect(() => {
      const duration = this.prefs.defaultTestDuration();
      this._testTime.set(duration);
      if (!this._testStarted()) {
        this._testTimeLeft.set(duration);
      }
    });

    this.destroyRef.onDestroy(() => this.secondTimer?.unsubscribe());
  }

  // Internal: word-list sync. Called by the component when wordListLoaded$
  // fires; lets us record the language used for scoring without leaking
  // WordService into this service's dependencies.
  syncLoadedLanguage(language: Language): void {
    this.loadedLanguage.set(language);
  }

  setupTest(): void {
    this.secondTimer?.unsubscribe();
    this.secondTimer = undefined;
    this._testTimeLeft.set(this._testTime());
    this._testStarted.set(false);
    this.running.set(false);
    this._results.set(emptyResults());
    this._currentIndex.set(0);
    this._words.set([]);
    this.fillWordList();
  }

  // Grows the word list lazily so there's always lookahead beyond the
  // cursor. Called after setup and after each advanceIndex().
  fillWordList(): void {
    const lookahead = WORD_LIST_LOOKAHEAD;
    while (this._currentIndex() > this._words().length - lookahead) {
      this._words.update((existing) =>
        existing.concat(this.wordService.getWords()),
      );
    }
  }

  startTest(): void {
    this._results.update((r) => ({ ...r, timeElapsed: 0 }));
    this._testStarted.set(true);
    this.running.set(true);
    this.secondTimer = timer(0, 1000).subscribe((seconds) =>
      this.onSecond(seconds),
    );
  }

  private onSecond(seconds: number): void {
    this._testTimeLeft.set(this._testTime() - seconds);
    if (seconds === this._testTime()) {
      this.endTest();
      return;
    }
    this._results.update((r) => ({ ...r, timeElapsed: seconds }));
  }

  endTest(): void {
    if (this.secondTimer) {
      this.secondTimer.unsubscribe();
      this.secondTimer = undefined;
    }
    this.running.set(false);
    this._hasCompletedFirstTest.set(true);
    this._results.update((r) => ({ ...r, timeElapsed: this._testTime() }));
    this.testEndedSubject.next();
  }

  // Records a typed word against the expected one. Returns whether the word
  // matched (so the component can apply the corresponding DOM class).
  recordWord(
    value: string,
    expected: string,
    wordCompleted: boolean,
  ): { wordIsCorrect: boolean } {
    const wordIsCorrect = this.compareWord(value, expected);

    this._results.update((r) => {
      const next: TestResults = {
        ...r,
        incorrectWords: r.incorrectWords,
      };

      if (wordCompleted) {
        if (wordIsCorrect) {
          next.correctWordCount = r.correctWordCount + 1;
        } else {
          next.incorrectWords = [...r.incorrectWords, { expected, value }];
          next.incorrectWordCount = r.incorrectWordCount + 1;
        }
      }

      // Per-character delta. The trailing space that completes a correct
      // word counts as a correct character; other length mismatches count
      // toward incorrect.
      let correctChars = wordCompleted && wordIsCorrect ? 1 : 0;
      let incorrectChars = Math.abs(value.length - expected.length);
      const sharedLength = Math.min(value.length, expected.length);
      for (let i = 0; i < sharedLength; i++) {
        if (value[i] === expected[i]) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      }
      next.correctCharacterCount = r.correctCharacterCount + correctChars;
      next.incorrectCharacterCount = r.incorrectCharacterCount + incorrectChars;

      return next;
    });

    return { wordIsCorrect };
  }

  // Used by the component during in-progress (mid-word) input to colour the
  // input box red/normal. Same comparison policy as recordWord.
  compareWord(value: string, expected: string): boolean {
    const ignoreCasing = this.prefs.ignoreCasing();
    const ignoreDiacritics = this.prefs.ignoreDiacritics();
    const language = this.loadedLanguage() ?? this.prefs.language();
    return LanguageService.compare(
      ignoreCasing ? value.toLowerCase() : value,
      ignoreCasing ? expected.toLowerCase() : expected,
      language,
      ignoreDiacritics,
    );
  }

  advanceIndex(): void {
    this._currentIndex.update((i) => i + 1);
    this.fillWordList();
  }

  // Word at the cursor (or undefined if the list hasn't grown yet — the
  // component must guard before reading it for end-of-test scoring).
  currentWord(): string | undefined {
    return this._words()[this._currentIndex()];
  }

  // Adjusting test duration writes back to preferences; the effect above
  // mirrors that change into testTime/testTimeLeft.
  decreaseDuration(): void {
    if (this._testStarted()) return;
    this.prefs.setPreference(
      Preference.DEFAULT_TEST_DURATION,
      nextDurationDown(this._testTime()),
    );
  }

  increaseDuration(): void {
    if (this._testStarted()) return;
    this.prefs.setPreference(
      Preference.DEFAULT_TEST_DURATION,
      nextDurationUp(this._testTime()),
    );
  }

  // Focus bridge — kept from the original service so other components
  // (preferences, app) can ask the typer to refocus its input.
  register(fn: () => void): void {
    this.focusFn = fn;
  }

  unregister(fn: () => void): void {
    if (this.focusFn === fn) this.focusFn = null;
  }

  requestFocus(): void {
    this.focusFn?.();
  }
}
