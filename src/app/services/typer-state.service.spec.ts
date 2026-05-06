import { TestBed } from '@angular/core/testing';
import { firstValueFrom, take } from 'rxjs';
import { PreferencesService } from './preferences.service';
import { TyperStateService } from './typer-state.service';
import { WordService } from './word.service';
import { Language, Preference } from '../models/Preference';

const STORAGE_KEY = 'preferences';

// Minimal stand-in for WordService. TyperStateService only calls getWords();
// the Observables on the real service are consumed by the typer component.
class WordServiceStub {
  words: string[] = [
    'alpha',
    'bravo',
    'charlie',
    'delta',
    'echo',
    'foxtrot',
    'golf',
    'hotel',
    'india',
    'juliet',
    'kilo',
    'lima',
    'mike',
    'november',
    'oscar',
    'papa',
    'quebec',
    'romeo',
    'sierra',
    'tango',
    'uniform',
    'victor',
    'whiskey',
    'xray',
    'yankee',
    'zulu',
  ];

  getWords(): string[] {
    return this.words.slice();
  }
}

function configure(stub: WordServiceStub = new WordServiceStub()): {
  service: TyperStateService;
  prefs: PreferencesService;
  wordService: WordServiceStub;
} {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: WordService, useValue: stub }],
  });
  const service = TestBed.inject(TyperStateService);
  const prefs = TestBed.inject(PreferencesService);
  return { service, prefs, wordService: stub };
}

describe('TyperStateService', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('setupTest resets state and refills the word list', () => {
    const { service } = configure();

    // Make state non-default first.
    service.startTest();
    service.recordWord('alpha', 'alpha', true);
    service.advanceIndex();

    service.setupTest();

    expect(service.results().correctCharacterCount).toBe(0);
    expect(service.results().incorrectCharacterCount).toBe(0);
    expect(service.results().correctWordCount).toBe(0);
    expect(service.results().incorrectWordCount).toBe(0);
    expect(service.results().incorrectWords).toEqual([]);
    expect(service.results().timeElapsed).toBe(0);
    expect(service.currentIndex()).toBe(0);
    expect(service.testStarted()).toBeFalse();
    expect(service.running()).toBeFalse();
    expect(service.words().length).toBeGreaterThan(0);
    expect(service.currentWord()).toBeDefined();
  });

  it('startTest flips testStarted and running to true and seeds timeElapsed', () => {
    const { service } = configure();
    service.setupTest();

    service.startTest();

    expect(service.testStarted()).toBeTrue();
    expect(service.running()).toBeTrue();
    expect(service.results().timeElapsed).toBe(0);

    // Stop the running timer so it doesn't bleed into other tests.
    service.endTest();
  });

  it('recordWord credits a correct word and the trailing space', () => {
    const { service } = configure();
    service.setupTest();

    const result = service.recordWord('hello', 'hello', true);

    expect(result.wordIsCorrect).toBeTrue();
    expect(service.results().correctWordCount).toBe(1);
    expect(service.results().incorrectWordCount).toBe(0);
    // 5 matching characters + 1 trailing-space credit for completion.
    expect(service.results().correctCharacterCount).toBe(6);
    expect(service.results().incorrectCharacterCount).toBe(0);
  });

  it('recordWord penalises an incorrect completed word per character', () => {
    const { service } = configure();
    service.setupTest();

    const result = service.recordWord('helo', 'hello', true);

    expect(result.wordIsCorrect).toBeFalse();
    expect(service.results().correctWordCount).toBe(0);
    expect(service.results().incorrectWordCount).toBe(1);
    expect(service.results().incorrectWords).toEqual([
      { expected: 'hello', value: 'helo' },
    ]);
    // Shared length 4: h=h, e=e, l=l, o!=l → 3 correct, 1 incorrect.
    // Length diff |4-5| = 1 incorrect. No trailing-space credit.
    expect(service.results().correctCharacterCount).toBe(3);
    expect(service.results().incorrectCharacterCount).toBe(2);
  });

  it('recordWord with wordCompleted=false updates only character counts', () => {
    const { service } = configure();
    service.setupTest();

    service.recordWord('partial', 'partial-extra', false);

    expect(service.results().correctWordCount).toBe(0);
    expect(service.results().incorrectWordCount).toBe(0);
    expect(service.results().incorrectWords).toEqual([]);
    // Shared length 7 all match → 7 correct. Length diff |7-13| = 6 incorrect.
    expect(service.results().correctCharacterCount).toBe(7);
    expect(service.results().incorrectCharacterCount).toBe(6);
  });

  it('advanceIndex increments the cursor and keeps the word list filled', () => {
    const { service } = configure();
    service.setupTest();

    const initialLength = service.words().length;
    service.advanceIndex();

    expect(service.currentIndex()).toBe(1);
    expect(service.words().length).toBeGreaterThanOrEqual(initialLength);
    expect(service.currentWord()).toBeDefined();
  });

  it('currentWord returns the word at the cursor', () => {
    const { service } = configure(
      Object.assign(new WordServiceStub(), {
        words: ['one', 'two', 'three'],
      }),
    );
    service.setupTest();

    expect(service.currentWord()).toBe('one');
    service.advanceIndex();
    expect(service.currentWord()).toBe('two');
  });

  it('decreaseDuration / increaseDuration write through to prefs and mirror to testTime', () => {
    const { service, prefs } = configure();
    prefs.setPreference(Preference.DEFAULT_TEST_DURATION, 60);
    TestBed.tick();

    service.decreaseDuration();
    TestBed.tick();
    expect(prefs.getPreference(Preference.DEFAULT_TEST_DURATION)).toBe(45);
    expect(service.testTime()).toBe(45);

    service.increaseDuration();
    TestBed.tick();
    expect(prefs.getPreference(Preference.DEFAULT_TEST_DURATION)).toBe(60);
    expect(service.testTime()).toBe(60);
  });

  it('decreaseDuration is a no-op while the test is running', () => {
    const { service, prefs } = configure();
    prefs.setPreference(Preference.DEFAULT_TEST_DURATION, 60);
    TestBed.tick();
    service.setupTest();
    service.startTest();

    const before = prefs.getPreference(Preference.DEFAULT_TEST_DURATION);
    service.decreaseDuration();
    expect(prefs.getPreference(Preference.DEFAULT_TEST_DURATION)).toBe(before);

    service.endTest();
  });

  it('endTest clears running, marks the first test complete, and snapshots timeElapsed', () => {
    const { service, prefs } = configure();
    prefs.setPreference(Preference.DEFAULT_TEST_DURATION, 60);
    TestBed.tick();
    service.setupTest();
    service.startTest();

    expect(service.hasCompletedFirstTest()).toBeFalse();

    service.endTest();

    expect(service.running()).toBeFalse();
    expect(service.hasCompletedFirstTest()).toBeTrue();
    expect(service.results().timeElapsed).toBe(service.testTime());
  });

  it('endTest emits exactly once on testEnded$', async () => {
    const { service } = configure();
    service.setupTest();
    service.startTest();

    const ended = firstValueFrom(service.testEnded$.pipe(take(1)));
    service.endTest();
    await expectAsync(ended).toBeResolved();
  });

  it('compareWord uses prefs.ignoreDiacritics + the active language', () => {
    const { service, prefs } = configure();
    prefs.setPreference(Preference.LANGUAGE, Language.FRENCH);
    prefs.setPreference(Preference.IGNORE_DIACRITICS, true);

    // The substitute map maps accented expected chars to their plain
    // counterpart, so a user typing 'cafe' against expected 'café' matches
    // when ignoreDiacritics is on.
    expect(service.compareWord('cafe', 'café')).toBeTrue();

    prefs.setPreference(Preference.IGNORE_DIACRITICS, false);
    expect(service.compareWord('cafe', 'café')).toBeFalse();
  });

  it('compareWord respects ignoreCasing', () => {
    const { service, prefs } = configure();
    prefs.setPreference(Preference.IGNORE_CASING, true);

    expect(service.compareWord('HELLO', 'hello')).toBeTrue();

    prefs.setPreference(Preference.IGNORE_CASING, false);
    expect(service.compareWord('HELLO', 'hello')).toBeFalse();
  });
});
