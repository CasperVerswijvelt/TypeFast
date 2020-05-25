export interface TestResults {
  correctCharacterCount: number;
  incorrectCharacterCount: number;
  correctWordCount: number;
  incorrectWordCount: number;
  incorrectWords: IncorrectWord[];
  timeElapsed: number;
  stats?: TestResultsStats;
}

export interface IncorrectWord {
  expected: string;
  value: string;
}

export interface TestResultsStats {
  characterAccuracy: number;
  wordAccuracy: number;
  cpm: number;
  wpm: number;
}
