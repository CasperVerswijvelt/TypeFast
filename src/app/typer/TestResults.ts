export interface TestResults {
  correctCharacterCount: number;
  incorrectCharacterCount: number;
  correctWordCount: number;
  incorrectWordCount: number;
  incorrectWords: IncorrectWord[];
}

export interface IncorrectWord {
  expected: string;
  value: string;
}
