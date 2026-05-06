import { TestBed } from '@angular/core/testing';
import { firstValueFrom, take } from 'rxjs';
import { PreferencesService } from './preferences.service';
import { WordService } from './word.service';
import { Language, Preference, WordMode } from '../models/Preference';

const STORAGE_KEY = 'preferences';

interface FetchSpyOptions {
  body?: string;
  status?: number;
}

function spyOnFetch(options: FetchSpyOptions = {}): jasmine.Spy {
  const body = options.body ?? '';
  const status = options.status ?? 200;
  // Build a fresh Response per call — Response bodies are single-use streams.
  return spyOn(window, 'fetch').and.callFake(() =>
    Promise.resolve(new Response(body, { status })),
  );
}

function injectWordService(): {
  service: WordService;
  prefs: PreferencesService;
} {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});
  const prefs = TestBed.inject(PreferencesService);
  const service = TestBed.inject(WordService);
  return { service, prefs };
}

// Awaits the in-flight loadLanguage that the construction-time effect kicks
// off. Without this, that load can settle in the middle of a test and stomp
// on state we just set up explicitly.
async function awaitInitialLoad(service: WordService): Promise<void> {
  const started = firstValueFrom(service.languageFetchStarted.pipe(take(1)));
  TestBed.tick();
  const { promise } = await started;
  await promise;
}

describe('WordService', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('returns the not-initialized fallback chunk before any list has loaded', () => {
    // Stub fetch with a never-resolving promise so the construction-time
    // effect can't race ahead and replace the initial state.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    spyOn(window, 'fetch').and.returnValue(new Promise<Response>(() => {}));

    const { service } = injectWordService();

    expect(service.getWords()).toEqual(
      'No word list has been loaded yet.'.split(' '),
    );
  });

  it('loadLanguage parses fetched text and feeds getWords()', async () => {
    spyOnFetch({ body: 'alpha bravo charlie delta echo foxtrot' });

    const { service } = injectWordService();
    await awaitInitialLoad(service);

    await service.loadLanguage(Language.ENGLISH_AMERICAN, WordMode.WORDS);

    const words = service.getWords(2);
    expect(words.length).toBe(2);
    for (const w of words) {
      expect([
        'alpha',
        'bravo',
        'charlie',
        'delta',
        'echo',
        'foxtrot',
      ]).toContain(w);
    }
  });

  it('exposes the loaded list as a signal with language + computed name on success', async () => {
    spyOnFetch({ body: 'alpha bravo charlie' });

    const { service } = injectWordService();
    await awaitInitialLoad(service);

    const loaded = service.loadedList();
    expect(loaded).not.toBeNull();
    expect(loaded?.language).toBe(Language.ENGLISH_AMERICAN);
    expect(loaded?.wordMode).toBe(WordMode.WORDS);
    expect(loaded?.wordListName).toBe('English (US)');
    expect(loaded?.shouldReverseScroll).toBeFalse();
  });

  it('loadFile primes CUSTOM language with file contents and name', async () => {
    spyOnFetch({ body: 'unused' });

    const { service, prefs } = injectWordService();
    await awaitInitialLoad(service);

    const file = new File(['hello world foo'], 'sample.txt', {
      type: 'text/plain',
    });
    await service.loadFile(file);

    expect(service.getCachedFileName()).toBe('sample.txt');

    // CUSTOM is a temporary preference, but loadLanguage's stale-fetch guard
    // checks prefs.language() — so we must flip it before loading.
    prefs.setPreference(Preference.LANGUAGE, Language.CUSTOM);
    await service.loadLanguage(Language.CUSTOM, WordMode.WORDS);

    const words = service.getWords(3);
    expect(words.length).toBe(3);
    for (const w of words) {
      expect(['hello', 'world', 'foo']).toContain(w);
    }
    // Distinct words drawn from a 3-word pool means we exhausted it.
    expect(new Set(words).size).toBe(3);
  });

  it('getRandomWords draws without replacement and refills', async () => {
    spyOnFetch({ body: 'one two three' });

    const { service } = injectWordService();
    await awaitInitialLoad(service);

    await service.loadLanguage(Language.ENGLISH_AMERICAN, WordMode.WORDS);

    const first = service.getWords(3);
    expect(first.length).toBe(3);
    expect(new Set(first).size).toBe(3);
    expect(first.sort()).toEqual(['one', 'three', 'two']);

    const second = service.getWords(3);
    expect(second.length).toBe(3);
    expect(new Set(second).size).toBe(3);
    expect(second.sort()).toEqual(['one', 'three', 'two']);
  });

  it('falls back gracefully when the fetch returns non-200', async () => {
    spyOnFetch({ body: '', status: 500 });

    const { service } = injectWordService();
    await awaitInitialLoad(service);

    // The promise resolves (the failure is swallowed in the catch handler).
    await expectAsync(
      service.loadLanguage(Language.ENGLISH_AMERICAN, WordMode.WORDS),
    ).toBeResolved();

    // The fallback list is marked active so getWords() routes to it instead
    // of the "not initialized" sentinel — better UX since a failed fetch
    // really is a different state from "haven't tried yet".
    const fallback = ['This', 'list', "doesn't", 'have', 'any', 'words.'];
    const words = service.getWords(6);
    expect(words.length).toBe(6);
    for (const w of words) {
      expect(fallback).toContain(w);
    }
    expect(new Set(words).size).toBe(6);
  });

  it('getLanguageString returns custom labels and quotes the cached file name', async () => {
    spyOnFetch({ body: 'unused' });

    const { service } = injectWordService();

    expect(service.getLanguageString(Language.ENGLISH_AMERICAN)).toBe(
      'English (US)',
    );

    const file = new File(['x y z'], 'foo.txt', { type: 'text/plain' });
    await service.loadFile(file);

    expect(service.getLanguageString(Language.CUSTOM)).toBe("'foo.txt'");
  });

  it('shouldReverseScroll is true for Arabic word lists', async () => {
    // Seed the preference before injecting WordService so the construction
    // effect doesn't kick off a stale english fetch.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ [Preference.LANGUAGE]: Language.ARABIC }),
    );
    spyOnFetch({ body: 'كلمة واحدة اثنان' });

    const { service } = injectWordService();

    await service.loadLanguage(Language.ARABIC, WordMode.WORDS);

    const loaded = service.loadedList();
    expect(loaded).not.toBeNull();
    expect(loaded?.language).toBe(Language.ARABIC);
    expect(loaded?.shouldReverseScroll).toBeTrue();
  });
});
