import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { WordService } from '../../services/word.service';
import { TestResults, TestResultsStats } from '../../models/TestResults';
import { timer, Subscription, BehaviorSubject } from 'rxjs';
import { PreferencesService } from '../../services/preferences.service';
import {
  Preference,
  WordMode,
  Language,
  TextSize,
} from '../../models/Preference';
import { skip } from 'rxjs/operators';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-typer',
  templateUrl: './typer.component.html',
  styleUrls: ['./typer.component.scss'],
})
export class TyperComponent implements OnInit {
  @Output() focusFunctionReady = new EventEmitter<() => void>();

  words: string[] = ['Loading...'];

  wordInput: string;
  wordMode: WordMode;

  currentWordElement: HTMLElement;
  containerElement: HTMLElement;
  inputElement: HTMLInputElement;
  inputWordCopy: HTMLElement;
  dummyInputElement: HTMLElement;

  testResults: TestResults;

  testTime: number;
  testTimeLeft: number;

  testStarted: boolean;
  wordListName: string = 'Loading ...';
  language: Language;
  reverseScroll = false;
  smoothScroll = true;
  ignoreAccentedCharacters: boolean;
  ignoreCasing: boolean;
  textSizeClass = '';
  ignoreResultsString = '';

  Preference = Preference;

  incorrectWordsOpen = false;

  preferences: Map<string, BehaviorSubject<any>>;

  private leftWordOffset: number = 0;
  private rightWordOffset: number = 0;
  private leftCharacterOffset: number = 0;
  private rightCharacterOffset: number = 0;
  private currentIndex: number;
  private reverseScrollWordList: boolean;
  private secondTimer: Subscription;

  constructor(
    private wordService: WordService,
    private cdRef: ChangeDetectorRef,
    private preferencesService: PreferencesService
  ) {
    this.wordService.addWordListListener(this.onUpdatedWordList.bind(this));

    this.preferences = preferencesService.getPreferences();

    this.testTime = this.preferences.get(
      Preference.DEFAULT_TEST_DURATION
    ).value;
    this.smoothScroll = this.preferences.get(Preference.SMOOTH_SCROLLING).value;
    this.ignoreAccentedCharacters = this.preferences.get(
      Preference.IGNORE_DIACRITICS
    ).value;
    this.ignoreCasing = this.preferences.get(Preference.IGNORE_CASING).value;
    this.wordMode = this.preferences.get(Preference.WORD_MODE).value;

    this.updateIgnoreResultString();
  }

  ngOnInit(): void {
    this.preferences
      .get(Preference.REVERSE_SCROLL)
      .pipe(skip(1))
      .subscribe(this.onReverseScrollPreferenceUpdated.bind(this));
    this.preferences
      .get(Preference.TEXT_SIZE)
      .pipe(skip(1))
      .subscribe(this.onTextSizePreferenceUpdated.bind(this));
    this.preferences
      .get(Preference.SMOOTH_SCROLLING)
      .pipe(skip(1))
      .subscribe(this.onSmoothScrollingPreferenceUpdated.bind(this));
    this.preferences
      .get(Preference.IGNORE_DIACRITICS)
      .pipe(skip(1))
      .subscribe(this.onIgnoreAccentedCharactersPreferenceUpdated.bind(this));
    this.preferences
      .get(Preference.IGNORE_CASING)
      .pipe(skip(1))
      .subscribe(this.onIgnoreCasingPreferenceUpdated.bind(this));

    this.containerElement = document.getElementsByClassName(
      'word-container'
    )[0] as HTMLElement;
    this.inputElement = document.getElementsByClassName(
      'word-input'
    )[0] as HTMLInputElement;
    this.dummyInputElement = document.getElementsByClassName(
      'word-input-dummy'
    )[0] as HTMLInputElement;
    this.inputWordCopy = document.getElementsByClassName(
      'word-copy'
    )[0] as HTMLInputElement;

    this.inputElement.onpaste = (e) => e.preventDefault();

    this.updateTimer(0);
    this.syncTextSizeClass();

    this.focusFunctionReady.emit(this.focusInput.bind(this));
    this.focusInput();
  }

  setupTest() {
    this.updateTimer(0);
    this.secondTimer?.unsubscribe();
    this.secondTimer = undefined;

    this.wordInput = '';
    this.currentIndex = 0;
    this.leftWordOffset = 0;
    this.rightWordOffset = 0;
    this.leftCharacterOffset = 0;
    this.rightCharacterOffset = 0;
    this.words = [];
    this.cdRef.detectChanges();
    this.fillWordList();
    this.cdRef.detectChanges();
    this.testResults = {
      correctCharacterCount: 0,
      incorrectCharacterCount: 0,
      correctWordCount: 0,
      incorrectWordCount: 0,
      incorrectWords: [],
      timeElapsed: 0,
    };

    this.inputElement.disabled = false;

    this.testStarted = false;
    this.syncCurrentWordElement();
    this.rightWordOffset = this.currentWordElement.getBoundingClientRect().width;
    this.syncOffset();
  }

  focusInput() {
    this.inputElement.focus();
    this.inputElement.select();
  }

  wordInputChanged(word: string) {
    if (!this.words) {
      this.inputElement.value = '';
      return;
    }

    // Start timer if not already started
    if (!this.testStarted) {
      this.startTest();
    }

    const regexEndWhitespace = /\s$/;
    const matchesEndWhitespace = regexEndWhitespace.test(word);

    this.wordInput = this.wordInput.trim();

    if (matchesEndWhitespace) {
      // Text input ends with whitespace character
      this.leftCharacterOffset = 0;
      if (word.length === 1) {
        // Space is the only character typed, reset value to nothing
        this.inputElement.value = '';
        this.syncOffset();
      } else {
        // Space typed, validate word
        this.registerWord(this.wordInput, this.words[this.currentIndex]);
        this.nextWord();
      }
    } else {
      // Text input doesn't end with whitespace character, update input color
      const curentWord = this.words[this.currentIndex]
        ? this.words[this.currentIndex]
        : '';
      const wordInput = this.wordInput ? this.wordInput : '';
      if (this.compare(wordInput, curentWord?.slice(0, wordInput.length))) {
        this.inputElement.classList.remove('input-incorrect');

        // Count matching characters
        let matchingCharacters = 0;
        let minLength = Math.min(wordInput.length, curentWord.length);
        for (let i = 0; i < minLength; i++) {
          if (this.compare(wordInput[i], curentWord[i])) {
            matchingCharacters++;
          } else {
            break;
          }
        }

        this.inputWordCopy.innerText = wordInput;
        this.leftCharacterOffset = this.inputWordCopy.getBoundingClientRect().width;
        this.syncOffset();
      } else {
        this.inputElement.classList.add('input-incorrect');
      }
    }
  }

  private compare(actual: string, expected: string): boolean {
    return LanguageService.compare(
      this.ignoreCasing ? actual.toLowerCase() : actual,
      this.ignoreCasing ? expected.toLowerCase() : expected,
      this.language,
      this.preferencesService.getPreference(Preference.IGNORE_DIACRITICS)
    );
  }

  private onReverseScrollPreferenceUpdated(value: any) {
    this.syncReverseScroll();
    this.syncOffset();
  }

  private onTextSizePreferenceUpdated(value: any) {
    this.syncTextSizeClass();
    this.setupTest();
  }

  private onSmoothScrollingPreferenceUpdated(value: any) {
    this.smoothScroll = value;
    this.syncOffset();
  }

  private onIgnoreAccentedCharactersPreferenceUpdated(value: any) {
    this.ignoreAccentedCharacters = value;
    this.setupTest();
    this.updateIgnoreResultString();
  }

  private onIgnoreCasingPreferenceUpdated(value: any) {
    this.ignoreCasing = value;
    this.setupTest();
    this.updateIgnoreResultString();
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

  onUpdatedWordList(
    language: Language,
    wordMode: WordMode,
    wordListName: string,
    shouldReverseScroll: boolean
  ) {
    this.reverseScrollWordList = shouldReverseScroll;
    this.wordListName = wordListName;
    this.wordMode = wordMode;
    this.language = language;
    this.syncReverseScroll();
    this.setupTest();
  }

  startTest() {
    this.secondTimer = timer(0, 1000).subscribe(this.onSecond.bind(this));
    this.testStarted = true;
    this.testResults.timeElapsed = 0;
  }

  nextWord() {
    this.currentIndex++;
    this.wordInput = '';
    this.inputElement.value = '';

    this.leftWordOffset =
      this.leftWordOffset +
      this.currentWordElement.getBoundingClientRect().width;
    this.syncCurrentWordElement();
    this.rightWordOffset =
      this.leftWordOffset +
      this.currentWordElement.getBoundingClientRect().width;
    this.syncOffset(true);

    this.fillWordList();
  }

  private fillWordList() {
    while (this.currentIndex > this.words.length - 20) {
      this.words = this.words.concat(this.wordService.getWords());
    }
  }

  private syncReverseScroll() {
    this.reverseScroll =
      this.preferences.get(Preference.REVERSE_SCROLL).value !==
      this.reverseScrollWordList;
  }

  private syncTextSizeClass() {
    switch (this.preferences.get(Preference.TEXT_SIZE).value) {
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

  registerWord(value: string, expected: string, wordCompleted: boolean = true) {
    if (wordCompleted) {
      if (this.compare(value, expected)) {
        this.currentWordElement.classList.add('word-correct');
        this.testResults.correctWordCount++;
      } else {
        this.testResults.incorrectWords.push({
          expected: expected,
          value: value,
        });
        this.currentWordElement.classList.add('word-incorrect');
        this.testResults.incorrectWordCount++;
      }
    }

    // Only add correct character for end space if word was completed
    let correctCharacters = wordCompleted ? 1 : 0;
    let incorrectCharacters = 0;

    let length = Math.min(value.length, expected.length);

    incorrectCharacters += Math.abs(value.length - expected.length);

    for (let i = 0; i < length; i++) {
      if (value[i] === expected[i]) {
        correctCharacters++;
      } else {
        incorrectCharacters++;
      }
    }

    this.testResults.correctCharacterCount += correctCharacters;
    this.testResults.incorrectCharacterCount += incorrectCharacters;
  }

  onSecond(seconds: number) {
    this.updateTimer(seconds);

    if (seconds === this.testTime) {
      this.onTimeRunsOut();
    }

    this.testResults.timeElapsed = seconds;
    this.calculateStats();
  }

  updateTimer(seconds: number) {
    this.testTimeLeft = this.testTime - seconds;
  }

  calculateStats() {
    let stats = {} as TestResultsStats;

    let totalCharacterCount =
      this.testResults.correctCharacterCount +
      this.testResults.incorrectCharacterCount;

    let totalWordCount =
      this.testResults.correctWordCount + this.testResults.incorrectWordCount;

    stats.characterAccuracy = totalCharacterCount
      ? this.testResults.correctCharacterCount / totalCharacterCount
      : 0;
    stats.wordAccuracy = totalWordCount
      ? this.testResults.correctWordCount / totalWordCount
      : 0;
    stats.cpm = this.testResults.timeElapsed
      ? (this.testResults.correctCharacterCount /
          this.testResults.timeElapsed) *
        60
      : 0;
    stats.wpm = this.testResults.timeElapsed
      ? (this.testResults.correctCharacterCount /
          5 /
          this.testResults.timeElapsed) *
        60
      : 0;

    this.testResults.stats = stats;
  }

  syncCurrentWordElement() {
    this.currentWordElement = this.containerElement.children[
      this.currentIndex
    ] as HTMLElement;
  }

  syncOffset(disableTransition = false) {
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
      this.containerElement.style.marginLeft = null;
      this.containerElement.style.marginRight = `calc(50% + ${rightOffset}px)`;
    } else {
      this.containerElement.style.marginRight = null;
      this.containerElement.style.marginLeft = `calc(50% - ${leftOffset}px)`;
    }
  }

  onTimeRunsOut() {
    this.secondTimer.unsubscribe();
    this.secondTimer = undefined;
    this.inputElement.disabled = true;
    this.dummyInputElement.focus();

    // Add right/wrong characters for current word
    this.registerWord(
      this.wordInput.trim(),
      this.words[this.currentIndex].slice(0, this.wordInput.length),
      false
    );
  }

  private breakPoints = [
    {
      seconds: 1,
      delta: 0,
    },
    {
      seconds: 5,
      delta: 1,
    },
    {
      seconds: 30,
      delta: 5,
    },
    {
      seconds: 120,
      delta: 15,
    },
    {
      seconds: 300,
      delta: 30,
    },
    {
      seconds: 600,
      delta: 60,
    },
    {
      seconds: 1800,
      delta: 300,
    },
    {
      seconds: 3600,
      delta: 600,
    },
    {
      seconds: 86400,
      delta: 3600,
    },
    {
      seconds: -1,
      delta: 7200,
    },
  ];

  onDecreaseClicked() {
    if (this.testStarted) return;

    let decrease = 0;

    this.breakPoints.every((breakpoint) => {
      if (this.testTime <= breakpoint.seconds || breakpoint.seconds == -1) {
        decrease = breakpoint.delta;
        return false;
      }
      return true;
    });

    this.testTime -= decrease;

    this.preferencesService.setPreference(
      Preference.DEFAULT_TEST_DURATION,
      this.testTime
    );

    this.updateTimer(0);
    this.focusInput();
  }

  onIncreaseClicked() {
    if (this.testStarted) return;

    let increase = 0;

    this.breakPoints.every((breakpoint) => {
      if (this.testTime < breakpoint.seconds || breakpoint.seconds == -1) {
        increase = breakpoint.delta;
        return false;
      }
      return true;
    });

    this.testTime += increase;

    this.preferencesService.setPreference(
      Preference.DEFAULT_TEST_DURATION,
      this.testTime
    );

    this.updateTimer(0);
    this.focusInput();
  }

  onRestartClicked() {
    this.setupTest();
    this.focusInput();
  }

  onIncorrectWordCountClicked() {
    this.incorrectWordsOpen = true;
  }
}
