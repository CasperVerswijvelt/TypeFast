import { calculateStats, emptyResults } from './test-stats';
import { TestResults } from '../models/TestResults';

describe('test-stats', () => {
  describe('emptyResults', () => {
    it('returns all-zero counts and empty arrays', () => {
      const results = emptyResults();

      expect(results.correctCharacterCount).toBe(0);
      expect(results.incorrectCharacterCount).toBe(0);
      expect(results.correctWordCount).toBe(0);
      expect(results.incorrectWordCount).toBe(0);
      expect(results.timeElapsed).toBe(0);
      expect(results.incorrectWords).toEqual([]);
      expect(results.stats).toBeUndefined();
    });

    it('returns a fresh object each invocation', () => {
      const a = emptyResults();
      const b = emptyResults();

      expect(a).not.toBe(b);
      expect(a.incorrectWords).not.toBe(b.incorrectWords);
    });
  });

  describe('calculateStats', () => {
    const baseResults = (
      overrides: Partial<TestResults> = {},
    ): TestResults => ({
      ...emptyResults(),
      ...overrides,
    });

    it('returns zeros (not NaN) when all counts are zero', () => {
      const stats = calculateStats(emptyResults());

      expect(stats.characterAccuracy).toBe(0);
      expect(stats.wordAccuracy).toBe(0);
      expect(stats.cpm).toBe(0);
      expect(stats.wpm).toBe(0);
    });

    it('computes cpm = 60 and wpm = 12 for 60 correct chars over 60s', () => {
      const stats = calculateStats(
        baseResults({
          correctCharacterCount: 60,
          incorrectCharacterCount: 0,
          timeElapsed: 60,
        }),
      );

      expect(stats.cpm).toBeCloseTo(60, 9);
      expect(stats.wpm).toBeCloseTo(12, 9);
    });

    it('reports 100% character accuracy when no incorrect chars', () => {
      const stats = calculateStats(
        baseResults({
          correctCharacterCount: 42,
          incorrectCharacterCount: 0,
          timeElapsed: 30,
        }),
      );

      expect(stats.characterAccuracy).toBe(1);
    });

    it('computes character accuracy from mixed correct/incorrect', () => {
      const stats = calculateStats(
        baseResults({
          correctCharacterCount: 7,
          incorrectCharacterCount: 3,
          timeElapsed: 10,
        }),
      );

      expect(stats.characterAccuracy).toBeCloseTo(0.7, 9);
    });

    it('computes word accuracy from mixed correct/incorrect', () => {
      const stats = calculateStats(
        baseResults({
          correctWordCount: 8,
          incorrectWordCount: 2,
          timeElapsed: 60,
        }),
      );

      expect(stats.wordAccuracy).toBeCloseTo(0.8, 9);
    });

    it('returns 0 for cpm/wpm when elapsed is 0 (no Infinity / NaN)', () => {
      const stats = calculateStats(
        baseResults({
          correctCharacterCount: 50,
          incorrectCharacterCount: 5,
          timeElapsed: 0,
        }),
      );

      expect(stats.cpm).toBe(0);
      expect(stats.wpm).toBe(0);
      expect(Number.isFinite(stats.cpm)).toBeTrue();
      expect(Number.isFinite(stats.wpm)).toBeTrue();
    });

    it('scales wpm as cpm/5 (5-character word convention)', () => {
      const stats = calculateStats(
        baseResults({
          correctCharacterCount: 100,
          timeElapsed: 60,
        }),
      );

      expect(stats.wpm).toBeCloseTo(stats.cpm / 5, 9);
    });

    it('only credits correct characters toward cpm/wpm', () => {
      const stats = calculateStats(
        baseResults({
          correctCharacterCount: 30,
          incorrectCharacterCount: 30,
          timeElapsed: 60,
        }),
      );

      expect(stats.cpm).toBeCloseTo(30, 9);
      expect(stats.wpm).toBeCloseTo(6, 9);
    });
  });
});
