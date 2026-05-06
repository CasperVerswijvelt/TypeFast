import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  afterNextRender,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NgClass, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { skip } from 'rxjs/operators';

import { WordService } from '../../services/word.service';
import { PreferencesService } from '../../services/preferences.service';
import { TyperStateService } from '../../services/typer-state.service';
import { Language, TextSize, WordMode } from '../../models/Preference';
import { PopperDirective } from '../../directives/popper.directive';
import { IncorrectWordComponent } from '../incorrect-word/incorrect-word.component';
import { TimePipe } from '../../pipes/time.pipe';
import { AdPlaceholderComponent } from '../ad-placeholder/ad-placeholder.component';
import { StatRowComponent } from '../shared/stat-row/stat-row.component';

@Component({
  selector: 'app-typer',
  templateUrl: './typer.component.html',
  styleUrls: ['./typer.component.scss'],
  imports: [
    NgClass,
    FormsModule,
    PopperDirective,
    IncorrectWordComponent,
    DecimalPipe,
    AdPlaceholderComponent,
    TimePipe,
    StatRowComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TyperComponent implements OnInit, OnDestroy {
  private readonly wordService = inject(WordService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly prefs = inject(PreferencesService);
  protected readonly state = inject(TyperStateService);
  private readonly destroyRef = inject(DestroyRef);

  // View / DOM
  wordInput = '';
  currentWordElement: HTMLElement | undefined;
  containerElement!: HTMLElement;
  inputElement!: HTMLInputElement;
  inputWordCopy!: HTMLElement;
  dummyInputElement!: HTMLElement;

  @ViewChild('wordContainer', { static: true })
  private wordContainerRef!: ElementRef<HTMLElement>;
  @ViewChild('wordInputEl', { static: true })
  private wordInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('wordInputDummy', { static: true })
  private wordInputDummyRef!: ElementRef<HTMLElement>;
  @ViewChild('wordCopy', { static: true })
  private wordCopyRef!: ElementRef<HTMLElement>;
  @ViewChild('incorrectWordsDialog', { static: true })
  private incorrectWordsDialogRef!: ElementRef<HTMLDialogElement>;

  // Derived display state.
  wordListName = 'Loading ...';
  language!: Language;
  wordMode: WordMode;
  reverseScroll = false;
  smoothScroll = true;
  ignoreAccentedCharacters = false;
  ignoreCasing = false;
  textSizeClass = '';
  ignoreResultsString = '';

  // Typed pref signals exposed to the template.
  protected readonly hideTimer = this.prefs.hideTimer;
  protected readonly hideLiveStats = this.prefs.hideLiveStats;
  protected readonly scrollingAnimation = this.prefs.scrollingAnimation;

  private leftWordOffset = 0;
  private rightWordOffset = 0;
  private leftCharacterOffset = 0;
  private rightCharacterOffset = 0;
  private reverseScrollWordList = false;
  private boundFocus: (() => void) | undefined;

  constructor() {
    this.smoothScroll = this.prefs.smoothScrolling();
    this.ignoreAccentedCharacters = this.prefs.ignoreDiacritics();
    this.ignoreCasing = this.prefs.ignoreCasing();
    this.wordMode = this.prefs.wordMode();

    this.updateIgnoreResultString();

    // React to preference changes that need imperative DOM follow-up. skip(1)
    // avoids re-firing on the seeded current value (which we already applied
    // above); takeUntilDestroyed cleans up subscriptions automatically.
    toObservable(this.prefs.reverseScroll)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(() => {
        this.syncReverseScroll();
        this.syncOffset();
      });
    toObservable(this.prefs.textSize)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(() => {
        this.syncTextSizeClass();
        this.setupTest();
      });
    toObservable(this.prefs.smoothScrolling)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe((value) => {
        this.smoothScroll = value;
        this.syncOffset();
      });
    toObservable(this.prefs.ignoreDiacritics)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe((value) => {
        this.ignoreAccentedCharacters = value;
        this.setupTest();
        this.updateIgnoreResultString();
      });
    toObservable(this.prefs.ignoreCasing)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe((value) => {
        this.ignoreCasing = value;
        this.setupTest();
        this.updateIgnoreResultString();
      });

    // When the test ends (timer hits 0), score the partial in-progress word
    // and shift focus off the input so the results stay visible. Done here
    // because the partial input lives in the view layer.
    this.state.testEnded$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.onTestEnded());

    // OnPush + signal reads in the template means we need to nudge CD when
    // we mutate signals from a non-template synchronous path (e.g. after
    // setupTest, before measuring DOM rectangles). The cdRef.detectChanges
    // calls below take care of that locally; this effect is only used for
    // host-class-style bindings if they ever appear.
    effect(() => {
      // Read these signals so the template re-renders when they change.
      // (No body needed — the read itself is the dependency.)
      void this.state.testStarted();
      void this.state.running();
    });

    afterNextRender(() => {
      this.inputElement.onpaste = (e) => e.preventDefault();
      this.focusInput();
    });
  }

  ngOnInit(): void {
    this.containerElement = this.wordContainerRef.nativeElement;
    this.inputElement = this.wordInputRef.nativeElement;
    this.dummyInputElement = this.wordInputDummyRef.nativeElement;
    this.inputWordCopy = this.wordCopyRef.nativeElement;

    this.syncTextSizeClass();

    this.boundFocus = this.focusInput.bind(this);
    this.state.register(this.boundFocus);

    // wordListLoaded$ is a ReplaySubject(1) so this fires immediately if the
    // list has already loaded by the time we subscribe. Has to run after
    // ngOnInit so DOM refs are populated before setupTest reads them.
    this.wordService.wordListLoaded
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update) => {
        this.reverseScrollWordList = update.shouldReverseScroll;
        this.wordListName = update.wordListName;
        this.wordMode = update.wordMode;
        this.language = update.language;
        this.state.syncLoadedLanguage(update.language);
        this.syncReverseScroll();
        this.setupTest();
      });
  }

  ngOnDestroy(): void {
    if (this.boundFocus) this.state.unregister(this.boundFocus);
    this.state.running.set(false);
  }

  // Resets test state and view-layer offsets, then measures the new layout.
  private setupTest(): void {
    this.wordInput = '';
    this.leftWordOffset = 0;
    this.rightWordOffset = 0;
    this.leftCharacterOffset = 0;
    this.rightCharacterOffset = 0;
    this.state.setupTest();
    this.cdRef.detectChanges();
    // The @for tracks by $index for stable diffing on duplicate words, which
    // means DOM nodes are reused across tests. Per-word classes were added
    // imperatively (.word-correct / .word-incorrect) and don't get cleared
    // by re-binding, so wipe them explicitly on the freshly-seeded nodes.
    this.containerElement
      .querySelectorAll('.word-correct, .word-incorrect')
      .forEach((el) => el.classList.remove('word-correct', 'word-incorrect'));
    this.inputElement.disabled = false;
    // Mid-word red colouring on the input also lingers across resets.
    this.inputElement.classList.remove('input-incorrect');
    this.syncCurrentWordElement();
    if (this.currentWordElement) {
      this.rightWordOffset =
        this.currentWordElement.getBoundingClientRect().width;
    }
    this.syncOffset();
  }

  focusInput(): void {
    this.inputElement.focus();
    this.inputElement.select();
  }

  // Public API for the template / event handlers below.
  wordInputChanged(word: string): void {
    if (this.state.words().length === 0) {
      this.inputElement.value = '';
      return;
    }

    if (!this.state.testStarted()) {
      this.state.startTest();
    }

    const endsWithWhitespace = /\s$/.test(word);
    this.wordInput = this.wordInput.trim();

    if (endsWithWhitespace) {
      this.leftCharacterOffset = 0;
      if (word.length === 1) {
        // Lone space — silently swallow, don't advance.
        this.inputElement.value = '';
        this.syncOffset();
      } else {
        const expected = this.state.currentWord() ?? '';
        const { wordIsCorrect } = this.state.recordWord(
          this.wordInput,
          expected,
          true,
        );
        if (this.currentWordElement) {
          this.currentWordElement.classList.add(
            wordIsCorrect ? 'word-correct' : 'word-incorrect',
          );
        }
        this.advanceWord();
      }
    } else {
      // Mid-word: update input colouring based on prefix match.
      const current = this.state.currentWord() ?? '';
      const wordInput = this.wordInput ?? '';
      if (
        this.state.compareWord(wordInput, current.slice(0, wordInput.length))
      ) {
        this.inputElement.classList.remove('input-incorrect');
        this.inputWordCopy.innerText = wordInput;
        this.leftCharacterOffset =
          this.inputWordCopy.getBoundingClientRect().width;
        this.syncOffset();
      } else {
        this.inputElement.classList.add('input-incorrect');
      }
    }
  }

  private advanceWord(): void {
    this.wordInput = '';
    this.inputElement.value = '';

    if (this.currentWordElement) {
      this.leftWordOffset +=
        this.currentWordElement.getBoundingClientRect().width;
    }
    this.state.advanceIndex();
    // Need DOM to reflect the new currentIndex (used by ngClass) and any
    // freshly-appended words before we measure the next word's width.
    this.cdRef.detectChanges();
    this.syncCurrentWordElement();
    if (this.currentWordElement) {
      this.rightWordOffset =
        this.leftWordOffset +
        this.currentWordElement.getBoundingClientRect().width;
    }
    this.syncOffset(true);
  }

  private onTestEnded(): void {
    this.inputElement.disabled = true;
    this.dummyInputElement.focus();

    // Score whatever partial word the user had in flight. Only the matched
    // prefix counts toward correct characters; the rest stays unscored.
    const currentWord = this.state.currentWord();
    if (currentWord !== undefined) {
      this.state.recordWord(
        this.wordInput.trim(),
        currentWord.slice(0, this.wordInput.length),
        false,
      );
    }
  }

  private updateIgnoreResultString() {
    this.ignoreResultsString = '';

    if (this.ignoreAccentedCharacters) {
      this.ignoreResultsString += 'accents';
      if (this.ignoreCasing) {
        this.ignoreResultsString += ', ';
      }
    }

    if (this.ignoreCasing) {
      this.ignoreResultsString += 'casing';
    }

    if (this.ignoreResultsString.length) {
      this.ignoreResultsString =
        this.ignoreResultsString.charAt(0).toUpperCase() +
        this.ignoreResultsString.slice(1);
    }
  }

  private syncReverseScroll() {
    this.reverseScroll =
      this.prefs.reverseScroll() !== this.reverseScrollWordList;
  }

  private syncTextSizeClass() {
    switch (this.prefs.textSize()) {
      case TextSize.SMALL:
        this.textSizeClass = 'text-size--small';
        break;
      case TextSize.LARGE:
        this.textSizeClass = 'text-size--large';
        break;
      default:
      case TextSize.MEDIUM:
        this.textSizeClass = 'text-size--medium';
        break;
    }
  }

  private syncCurrentWordElement(): void {
    this.currentWordElement = this.containerElement.children[
      this.state.currentIndex()
    ] as HTMLElement | undefined;
  }

  private syncOffset(disableTransition = false): void {
    if (!this.containerElement) return;

    let leftOffset: number;
    let rightOffset: number;

    if (this.smoothScroll && !this.reverseScroll) {
      leftOffset = this.leftWordOffset + this.leftCharacterOffset;
      rightOffset = this.rightWordOffset + this.rightCharacterOffset;

      if (disableTransition) this.inputElement.style.transition = 'none';

      this.inputElement.style.paddingLeft =
        'calc(50% - ' + this.leftCharacterOffset + 'px)';
      this.inputElement.getClientRects(); // Trigger css reflow
      this.inputElement.style.removeProperty('transition');
    } else {
      leftOffset = 80 + this.leftWordOffset;
      rightOffset = 80 - this.rightWordOffset;
      this.inputElement.style.removeProperty('padding-left');
    }

    if (this.reverseScroll) {
      this.containerElement.style.marginLeft = '';
      this.containerElement.style.marginRight = `calc(50% + ${rightOffset}px)`;
    } else {
      this.containerElement.style.marginRight = '';
      this.containerElement.style.marginLeft = `calc(50% - ${leftOffset}px)`;
    }
  }

  onDecreaseClicked(): void {
    this.state.decreaseDuration();
    this.focusInput();
  }

  onIncreaseClicked(): void {
    this.state.increaseDuration();
    this.focusInput();
  }

  onRestartClicked(): void {
    this.setupTest();
    this.focusInput();
  }

  onIncorrectWordCountClicked(): void {
    this.incorrectWordsDialogRef.nativeElement.showModal();
  }

  // Native <dialog> doesn't auto-close when the user clicks the backdrop;
  // a click whose target is the dialog itself (not inner content) is a
  // backdrop click.
  onDialogBackdropClick(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target === dialog) dialog.close();
  }
}
