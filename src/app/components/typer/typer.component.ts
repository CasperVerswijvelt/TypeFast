import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { WordService } from '../../services/word.service';
import { TestResults, TestResultsStats } from '../../models/TestResults';
import { timer, Subscription, BehaviorSubject } from 'rxjs';
import { PreferencesService } from '../../services/preferences.service';
import { Preference, WordMode, Language, TextSize } from '../../models/Preference';
import { skip } from 'rxjs/operators';

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

  testResults: TestResults;

  testTime: number;
  testTimeLeft: number;

  testStarted: boolean;
  wordListName: string = '';
  reverseScroll = false;
  textSizeClass = '';

  incorrectWordsOpen = false;

  preferences: Map<string, BehaviorSubject<any>>;

  private leftOffset: number = 0;
  private rightOffset: number = 0;
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

    this.preferences
      .get(Preference.DEFAULT_WORD_MODE)
      .pipe(skip(1))
      .subscribe(this.onDefaultWordModePreferenceUpdated.bind(this));
    this.preferences
      .get(Preference.REVERSE_SCROLL)
      .pipe(skip(1))
      .subscribe(this.onReverseScrollPreferenceUpdated.bind(this));
    this.preferences.get(Preference.TEXT_SIZE).pipe(skip(1)).subscribe(this.onTextSizePreferenceUpdated.bind(this));

    this.testTime = this.preferences.get(Preference.DEFAULT_TEST_DURATION).value;
  }

  ngOnInit(): void {
    this.containerElement = document.getElementsByClassName('word-container')[0] as HTMLElement;
    this.inputElement = document.getElementsByClassName('word-input')[0] as HTMLInputElement;

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
    this.leftOffset = 0;
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
    this.rightOffset = this.currentWordElement.getBoundingClientRect().width;
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

    const regex = /\s$/;
    const matches = regex.test(word);

    this.wordInput = this.wordInput.trim();

    if (matches) {
      // Text input ends with whitespace character
      if (word.length === 1) {
        // Space is the only character typed, reset value to nothing
        this.inputElement.value = '';
      } else {
        // Space typed, validate word
        this.registerWord(this.wordInput, this.words[this.currentIndex]);
        this.nextWord();
      }
    } else {
      // Text input doesnt end with whitespace character, update input color
      if (this.words[this.currentIndex].slice(0, this.wordInput.length) !== this.wordInput) {
        this.inputElement.classList.add('input-incorrect');
      } else {
        this.inputElement.classList.remove('input-incorrect');
      }
    }
  }

  private onDefaultWordModePreferenceUpdated(value: any) {
    this.setupTest();
  }

  private onReverseScrollPreferenceUpdated(value: any) {
    this.syncReverseScroll();
    this.syncOffset();
  }

  private onTextSizePreferenceUpdated(value: any) {
    this.syncTextSizeClass();
    this.setupTest();
  }

  onUpdatedWordList(wordMode: WordMode, wordListName: string, shouldReverseScroll: boolean) {
    if (wordMode === this.preferences.get(Preference.DEFAULT_WORD_MODE).value) {
      this.reverseScrollWordList = shouldReverseScroll;
      this.wordListName = wordListName;
      this.syncReverseScroll();
      this.setupTest();
    }
  }

  startTest() {
    this.secondTimer = timer(0, 1000).subscribe(this.onSecond.bind(this));
    this.testStarted = true;
    this.testResults.timeElapsed = this.testTime;
  }

  nextWord() {
    this.currentIndex++;
    this.wordInput = '';
    this.inputElement.value = '';

    this.leftOffset = this.leftOffset + this.currentWordElement.getBoundingClientRect().width;
    this.syncCurrentWordElement();
    this.rightOffset = this.leftOffset + this.currentWordElement.getBoundingClientRect().width;
    this.syncOffset();

    this.fillWordList();
  }

  private fillWordList() {
    while (this.currentIndex > this.words.length - 20) {
      this.words = this.words.concat(this.getWords());
    }
  }

  private syncReverseScroll() {
    this.reverseScroll = this.preferences.get(Preference.REVERSE_SCROLL).value !== this.reverseScrollWordList;
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

  getWords(): string[] {
    let words =
      this.preferences.get(Preference.DEFAULT_WORD_MODE).value === WordMode.SENTENCES
        ? this.wordService.getSentence()
        : this.wordService.getWords();
    return words;
  }

  registerWord(value: string, expected: string, wordCompleted: boolean = true) {
    if (wordCompleted) {
      if (value === expected) {
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

    let totalCharacterCount = this.testResults.correctCharacterCount + this.testResults.incorrectCharacterCount;

    let totalWordCount = this.testResults.correctWordCount + this.testResults.incorrectWordCount;

    stats.characterAccuracy = totalCharacterCount ? this.testResults.correctCharacterCount / totalCharacterCount : 0;
    stats.wordAccuracy = totalWordCount ? this.testResults.correctWordCount / totalWordCount : 0;
    stats.cpm = this.testResults.timeElapsed
      ? (this.testResults.correctCharacterCount / this.testResults.timeElapsed) * 60
      : 0;
    stats.wpm = this.testResults.timeElapsed
      ? (this.testResults.correctCharacterCount / 5 / this.testResults.timeElapsed) * 60
      : 0;

    this.testResults.stats = stats;
  }

  syncCurrentWordElement() {
    this.currentWordElement = this.containerElement.children[this.currentIndex] as HTMLElement;
  }

  syncOffset() {
    if (!this.containerElement) return;

    if (this.reverseScroll) {
      this.containerElement.style.marginLeft = null;
      this.containerElement.style.marginRight = `calc(50% + 80px - ${this.rightOffset}px)`;
    } else {
      this.containerElement.style.marginRight = null;
      this.containerElement.style.marginLeft = `calc(50% - 80px - ${this.leftOffset}px)`;
    }
  }

  onTimeRunsOut() {
    this.secondTimer.unsubscribe();
    this.secondTimer = undefined;
    this.inputElement.disabled = true;

    // Add right/wrong characters for current word
    this.registerWord(this.wordInput.trim(), this.words[this.currentIndex].slice(0, this.wordInput.length), false);
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

    this.preferencesService.setPreference(Preference.DEFAULT_TEST_DURATION, this.testTime);

    this.updateTimer(0);
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

    this.preferencesService.setPreference(Preference.DEFAULT_TEST_DURATION, this.testTime);

    this.updateTimer(0);
  }

  onRestartClicked() {
    this.setupTest();
    this.focusInput();
  }

  onIncorrectWordCountClicked() {
    this.incorrectWordsOpen = true;
  }
}
