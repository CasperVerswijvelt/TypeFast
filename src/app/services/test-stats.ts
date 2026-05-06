import { TestResults, TestResultsStats } from '../models/TestResults';

// Pure helper: derives accuracy / WPM / CPM from the accumulated counts.
// Lives outside any component or service so it can be unit-tested directly.
export function calculateStats(results: TestResults): TestResultsStats {
  const totalCharacters =
    results.correctCharacterCount + results.incorrectCharacterCount;
  const totalWords = results.correctWordCount + results.incorrectWordCount;
  const elapsed = results.timeElapsed;

  return {
    characterAccuracy: totalCharacters
      ? results.correctCharacterCount / totalCharacters
      : 0,
    wordAccuracy: totalWords ? results.correctWordCount / totalWords : 0,
    cpm: elapsed ? (results.correctCharacterCount / elapsed) * 60 : 0,
    // WPM normalises CPM to a 5-character "word" — the standard typing-test
    // definition. Avoids penalising languages with longer words.
    wpm: elapsed ? (results.correctCharacterCount / 5 / elapsed) * 60 : 0,
  };
}

export function emptyResults(): TestResults {
  return {
    correctCharacterCount: 0,
    incorrectCharacterCount: 0,
    correctWordCount: 0,
    incorrectWordCount: 0,
    incorrectWords: [],
    timeElapsed: 0,
  };
}
