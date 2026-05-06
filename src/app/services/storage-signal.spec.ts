import { isSignal } from '@angular/core';
import { readJSON, signalsFromDefaults, writeJSON } from './storage-signal';

describe('storage-signal helpers', () => {
  beforeEach(() => localStorage.clear());

  describe('readJSON', () => {
    it('returns null for a missing key', () => {
      expect(readJSON('missing')).toBeNull();
    });

    it('parses a stored JSON value', () => {
      localStorage.setItem('hello', JSON.stringify({ a: 1, b: 'two' }));
      expect(readJSON<{ a: number; b: string }>('hello')).toEqual({
        a: 1,
        b: 'two',
      });
    });

    it('returns null for a malformed JSON value rather than throwing', () => {
      localStorage.setItem('broken', '{not json');
      expect(readJSON('broken')).toBeNull();
    });
  });

  describe('writeJSON', () => {
    it('round-trips an object via readJSON', () => {
      writeJSON('cfg', { theme: 'dark', count: 3 });
      expect(readJSON<{ theme: string; count: number }>('cfg')).toEqual({
        theme: 'dark',
        count: 3,
      });
    });

    it('does not throw when serialization fails', () => {
      const cyclic: Record<string, unknown> = {};
      cyclic['self'] = cyclic;
      expect(() => writeJSON('bad', cyclic)).not.toThrow();
    });
  });

  describe('signalsFromDefaults', () => {
    it('creates one writable signal per key, seeded with the default value', () => {
      const signals = signalsFromDefaults({
        a: 1,
        b: 'hello',
        c: true,
      });

      expect(isSignal(signals.a)).toBeTrue();
      expect(isSignal(signals.b)).toBeTrue();
      expect(isSignal(signals.c)).toBeTrue();
      expect(signals.a()).toBe(1);
      expect(signals.b()).toBe('hello');
      expect(signals.c()).toBeTrue();
    });

    it('produces independent writable signals', () => {
      const signals = signalsFromDefaults({ x: 0, y: 0 });
      signals.x.set(42);
      expect(signals.x()).toBe(42);
      expect(signals.y()).toBe(0);
    });
  });
});
