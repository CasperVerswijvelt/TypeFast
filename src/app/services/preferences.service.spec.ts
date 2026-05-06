import { TestBed } from '@angular/core/testing';
import { PreferencesService } from './preferences.service';
import {
  Language,
  Preference,
  Preferences,
  TextSize,
  Theme,
  WordMode,
} from '../models/Preference';

const STORAGE_KEY = 'preferences';

function readStorage(): Preferences {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Preferences) : {};
}

function makeService(): PreferencesService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});
  return TestBed.inject(PreferencesService);
}

describe('PreferencesService', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('seeds default values when localStorage is empty', () => {
    const prefs = TestBed.inject(PreferencesService);

    expect(prefs.getPreference(Preference.THEME)).toBe(Theme.DARK);
    expect(prefs.getPreference(Preference.LANGUAGE)).toBe(
      Language.ENGLISH_AMERICAN,
    );
    expect(prefs.getPreference(Preference.DEFAULT_TEST_DURATION)).toBe(60);
    expect(prefs.getPreference(Preference.WORD_MODE)).toBe(WordMode.WORDS);
    expect(prefs.getPreference(Preference.TEXT_SIZE)).toBe(TextSize.MEDIUM);
    expect(prefs.getPreference(Preference.FOLLOW_SYSTEM_THEME)).toBeFalse();
    expect(prefs.getPreference(Preference.SMOOTH_SCROLLING)).toBeTrue();
    expect(prefs.getPreference(Preference.SCROLLING_ANIMATION)).toBeTrue();
    expect(prefs.getPreference(Preference.IGNORE_DIACRITICS)).toBeFalse();
    expect(prefs.getPreference(Preference.IGNORE_CASING)).toBeFalse();
    expect(prefs.getPreference(Preference.HIDE_TIMER)).toBeFalse();
    expect(prefs.getPreference(Preference.HIDE_LIVE_STATS)).toBeFalse();
    expect(prefs.getPreference(Preference.REVERSE_SCROLL)).toBeFalse();
  });

  it('hydrates from localStorage on construction', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ [Preference.THEME]: Theme.LIGHT }),
    );

    const prefs = makeService();

    expect(prefs.theme()).toBe(Theme.LIGHT);
    expect(prefs.getPreference(Preference.THEME)).toBe(Theme.LIGHT);
  });

  it('ignores stored values whose type does not match the preference', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        [Preference.SMOOTH_SCROLLING]: 'not-a-boolean',
        [Preference.THEME]: 'not-a-theme',
      }),
    );

    const prefs = makeService();

    expect(prefs.smoothScrolling()).toBeTrue();
    expect(prefs.theme()).toBe(Theme.DARK);
  });

  it('skips persisted Language=CUSTOM during hydration (temporary preference)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ [Preference.LANGUAGE]: Language.CUSTOM }),
    );

    const prefs = makeService();

    expect(prefs.language()).toBe(Language.ENGLISH_AMERICAN);
  });

  it('falls back to defaults when stored JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');

    const prefs = makeService();

    expect(prefs.theme()).toBe(Theme.DARK);
  });

  it('updates the signal and writes to localStorage on setPreference', () => {
    const prefs = TestBed.inject(PreferencesService);

    prefs.setPreference(Preference.THEME, Theme.LIGHT);

    expect(prefs.theme()).toBe(Theme.LIGHT);
    expect(readStorage()[Preference.THEME]).toBe(Theme.LIGHT);
  });

  it('rejects an invalid value silently (no signal or storage change)', () => {
    const prefs = TestBed.inject(PreferencesService);
    const before = readStorage();

    // Bad cast: send a string where a boolean is expected.
    prefs.setPreference(
      Preference.SMOOTH_SCROLLING,
      'nope' as unknown as boolean,
    );

    expect(prefs.smoothScrolling()).toBeTrue();
    expect(readStorage()).toEqual(before);
  });

  it('does not persist Language=CUSTOM but still updates the signal', () => {
    const prefs = TestBed.inject(PreferencesService);

    prefs.setPreference(Preference.LANGUAGE, Language.CUSTOM);

    expect(prefs.language()).toBe(Language.CUSTOM);
    expect(readStorage()[Preference.LANGUAGE]).toBeUndefined();
  });

  it('preserves earlier writes when persisting subsequent preferences', () => {
    const prefs = TestBed.inject(PreferencesService);

    prefs.setPreference(Preference.THEME, Theme.LIGHT);
    prefs.setPreference(Preference.DEFAULT_TEST_DURATION, 30);

    const stored = readStorage();
    expect(stored[Preference.THEME]).toBe(Theme.LIGHT);
    expect(stored[Preference.DEFAULT_TEST_DURATION]).toBe(30);
  });

  it('clearPreferences resets signals to defaults and removes the storage key', () => {
    const prefs = TestBed.inject(PreferencesService);

    prefs.setPreference(Preference.THEME, Theme.LIGHT);
    prefs.setPreference(Preference.DEFAULT_TEST_DURATION, 30);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    prefs.clearPreferences();

    expect(prefs.theme()).toBe(Theme.DARK);
    expect(prefs.getPreference(Preference.DEFAULT_TEST_DURATION)).toBe(60);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('reflects updates to the signal returned by preference()', () => {
    const prefs = TestBed.inject(PreferencesService);
    const themeSignal = prefs.preference(Preference.THEME);

    expect(themeSignal()).toBe(Theme.DARK);

    prefs.setPreference(Preference.THEME, Theme.LIGHT);

    expect(themeSignal()).toBe(Theme.LIGHT);
  });

  it('updates signals when a storage event fires for the preferences key', () => {
    const prefs = TestBed.inject(PreferencesService);
    expect(prefs.theme()).toBe(Theme.DARK);

    const event = new StorageEvent('storage', {
      key: STORAGE_KEY,
      oldValue: JSON.stringify({ [Preference.THEME]: Theme.DARK }),
      newValue: JSON.stringify({ [Preference.THEME]: Theme.LIGHT }),
    });
    window.dispatchEvent(event);

    expect(prefs.theme()).toBe(Theme.LIGHT);
  });

  it('ignores storage events for unrelated keys', () => {
    const prefs = TestBed.inject(PreferencesService);

    const event = new StorageEvent('storage', {
      key: 'something-else',
      oldValue: null,
      newValue: JSON.stringify({ [Preference.THEME]: Theme.LIGHT }),
    });
    window.dispatchEvent(event);

    expect(prefs.theme()).toBe(Theme.DARK);
  });
});
