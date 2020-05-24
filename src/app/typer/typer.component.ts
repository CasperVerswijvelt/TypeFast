import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { WordService } from '../word.service';
import { TestResults, TestResultsStats } from './TestResults';
import { timer, Observable, Subscription } from 'rxjs';
import { PreferencesService } from '../preferences.service';
import { Preference } from '../Preference';

@Component({
  selector: 'app-typer',
  templateUrl: './typer.component.html',
  styleUrls: ['./typer.component.scss'],
})
export class TyperComponent implements OnInit {
  @Output() focusFunctionReady = new EventEmitter<() => void>();

  words: string[];
  currentIndex: number;
  wordInput: string;
  leftOffset: number = 0;

  currentWordElement: HTMLElement;
  containerElement: HTMLElement;
  inputElement: HTMLInputElement;

  testResults: TestResults;

  testTime = 60;
  testTimeLeft: number;

  private secondTimer: Subscription;
  testStarted: boolean;

  constructor(
    private wordService: WordService,
    private cdRef: ChangeDetectorRef,
    private preferencesService: PreferencesService
  ) {}

  ngOnInit(): void {
    this.containerElement = document.getElementsByClassName(
      'word-container'
    )[0] as HTMLElement;
    this.inputElement = document.getElementsByClassName(
      'word-input'
    )[0] as HTMLInputElement;

    this.inputElement.onpaste = (e) => e.preventDefault();

    this.updateTimer(0);

    this.wordService.addListener(this.setupTest.bind(this));
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
    this.words = this.getWords();
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
    this.syncLeft();
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

    this.wordInput = this.wordInput.trim();

    this.syncCurrentWordElement();

    if (word[word.length - 1] == ' ') {
      if (word.length === 1) {
        this.inputElement.value = '';
      } else {
        //Space typed, validate word
        this.registerWord(this.wordInput, this.words[this.currentIndex]);

        this.nextWord();
      }
    } else {
      if (
        this.words[this.currentIndex].slice(0, this.wordInput.length) !==
        this.wordInput
      ) {
        this.inputElement.classList.add('input-incorrect');
      } else {
        this.inputElement.classList.remove('input-incorrect');
      }
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

    this.leftOffset =
      this.leftOffset + this.currentWordElement.getBoundingClientRect().width;
    this.syncCurrentWordElement();
    this.syncLeft();

    if (this.currentIndex > this.words.length - 20) {
      this.words = this.words.concat(this.getWords());
    }
  }

  getWords () : string [] {
    return this.wordService.getWords(this.preferencesService.getPreference(Preference.SHUFFLE_WORDS) as boolean, 100);
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

  syncLeft() {
    this.containerElement.style.marginLeft = `calc(50% - 80px - ${this.leftOffset}px)`;
  }

  onTimeRunsOut() {
    this.secondTimer.unsubscribe();
    this.secondTimer = undefined;
    this.inputElement.disabled = true;

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

    this.updateTimer(0);
  }

  onRestartClicked() {
    this.setupTest();
    this.focusInput();
  }
}
