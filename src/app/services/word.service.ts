import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  Signal,
  WritableSignal,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { PreferencesService } from './preferences.service';
import { Language, WordMode } from '../models/Preference';
import { LanguageService } from './language.service';

export interface WordListLoaded {
  language: Language;
  wordMode: WordMode;
  wordListName: string;
  shouldReverseScroll: boolean;
}

export interface LanguageFetchStarted {
  language: Language;
  wordMode: WordMode;
  promise: Promise<void>;
}

const DEFAULT_WORD_AMOUNT = 100;
const LANGUAGE_PREFERENCE_CHANGED =
  'Language preference changed during loading, cancelling.';

@Injectable({
  providedIn: 'root',
})
export class WordService {
  private words: string[] = ['Word', 'list', 'not', 'initialized', 'yet.'];
  private sentences: string[][] = [
    ['This', 'language', "doesn't", 'have', 'any', 'sentences.'],
  ];

  private cachedFileText: string | undefined;
  private cachedFileName: string | undefined;

  private wordsCopy: string[] = [];
  private sentencesCopy: string[][] = [];

  private lastLoadedListLanguage: Language | undefined;
  private lastLoadedListMode: WordMode | undefined;
  private currentSource: string | undefined;

  // Latest loaded word list. null while no list has finished loading yet.
  // The signal is the canonical source; the Observable is a thin replay
  // wrapper for callers that want event-style coordination (e.g. the typer
  // component, where reacting via subscribe avoids running DOM-mutating code
  // inside an Angular effect callback).
  private readonly loadedListSignal: WritableSignal<WordListLoaded | null> =
    signal(null);
  readonly loadedList: Signal<WordListLoaded | null> =
    this.loadedListSignal.asReadonly();

  private readonly wordListLoaded$ = new ReplaySubject<WordListLoaded>(1);
  readonly wordListLoaded: Observable<WordListLoaded> =
    this.wordListLoaded$.asObservable();

  private readonly languageFetchStarted$ = new Subject<LanguageFetchStarted>();
  readonly languageFetchStarted: Observable<LanguageFetchStarted> =
    this.languageFetchStarted$.asObservable();

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly prefs = inject(PreferencesService);

  constructor() {
    // Effect re-runs whenever language or word-mode preferences change. It
    // also fires once on construction with the seeded defaults; we only
    // network-fetch in the browser to keep SSR rendering clean.
    effect(() => {
      const language = this.prefs.language();
      const wordMode = this.prefs.wordMode();
      if (this.isBrowser) {
        this.loadLanguage(language, wordMode);
      }
    });
  }

  loadFile(file: File): Promise<void> {
    return this.getTextViaFile(file).then((text) => {
      this.cachedFileText = text;
      this.cachedFileName = file.name;
    });
  }

  loadLanguage(language: Language, wordMode: WordMode): Promise<void> {
    const langString = this.getLanguageString(language);
    const getTextPromise =
      language === Language.CUSTOM
        ? Promise.resolve(this.cachedFileText ?? '')
        : this.getTextViaUrl(`assets/languages/${language}/${wordMode}.txt`);

    const promise = getTextPromise
      .then((text: string) => {
        // Drop late-arriving fetches when the user has switched language
        // mid-flight; the promise from the newer fetch will succeed instead.
        if (this.prefs.language() !== language) {
          return Promise.reject(LANGUAGE_PREFERENCE_CHANGED);
        }
        this.parseText(wordMode, text);
        this.lastLoadedListLanguage = language;
        this.lastLoadedListMode = wordMode;
        this.currentSource = langString;
        const update: WordListLoaded = {
          language,
          wordMode,
          wordListName: langString,
          shouldReverseScroll: this.shouldReverseScroll(language),
        };
        this.loadedListSignal.set(update);
        this.wordListLoaded$.next(update);
        return undefined;
      })
      .catch((e) => {
        if (e !== LANGUAGE_PREFERENCE_CHANGED) {
          this.loadDefaultList(WordMode.WORDS);
        }
      });

    this.languageFetchStarted$.next({ language, wordMode, promise });

    return promise;
  }

  getWords(wordCount?: number): string[] {
    if (this.lastLoadedListMode === WordMode.WORDS) {
      return this.getRandomWords(wordCount);
    } else if (this.lastLoadedListMode === WordMode.SENTENCES) {
      return this.getSentence();
    } else {
      return 'No word list has been loaded yet.'.split(' ');
    }
  }

  getCachedFileName(): string | undefined {
    return this.cachedFileName;
  }

  getLanguageString(language: Language): string {
    let langString = LanguageService.getLanguageString(language);
    if (language === Language.CUSTOM && this.cachedFileName) {
      langString = `'${this.cachedFileName}'`;
    }
    return langString;
  }

  private getTextViaFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.type !== 'text/plain') {
        reject(new Error('File is not a text file'));
        return;
      }
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => reject(fr.error ?? new Error('FileReader failed'));
      fr.readAsText(file);
    });
  }

  private getTextViaUrl(url: string): Promise<string> {
    return fetch(url).then((response) => {
      if (response.status !== 200) {
        return Promise.reject(new Error("Text file couldn't be fetched"));
      }
      return response.text();
    });
  }

  private parseText(wordMode: WordMode, text: string) {
    // Normalize to NFC so word lengths and per-character comparisons match
    // user keyboard input (which is virtually always NFC) regardless of the
    // source file's encoding.
    const normalized = text.normalize('NFC');
    if (wordMode === WordMode.WORDS) {
      this.words = normalized.split(/\s+/);
      this.wordsCopy = [];
    } else if (wordMode === WordMode.SENTENCES) {
      const lines = normalized.match(/[^\r\n]+/g) ?? [];
      this.sentences = lines.map((line) => line.split(/\s+/));
      this.sentencesCopy = [];
    }
  }

  private loadDefaultList(format: WordMode) {
    if (format === WordMode.WORDS) {
      this.words = ['This', 'list', "doesn't", 'have', 'any', 'words.'];
      this.wordsCopy = [];
    } else if (format === WordMode.SENTENCES) {
      this.sentences = [
        ['This', 'list', "doesn't", 'have', 'any', 'sentences.'],
      ];
      this.sentencesCopy = [];
    }
    // Mark the loaded mode so getWords() routes to the fallback list rather
    // than the "not initialized" placeholder.
    this.lastLoadedListMode = format;
  }

  private getRandomWords(wordCount?: number): string[] {
    const count = wordCount ?? DEFAULT_WORD_AMOUNT;
    const res: string[] = [];
    while (res.length < count) {
      if (this.wordsCopy.length === 0) {
        this.wordsCopy = this.words.slice();
      }
      const idx = Math.floor(Math.random() * this.wordsCopy.length);
      res.push(this.wordsCopy[idx]);
      this.wordsCopy.splice(idx, 1);
    }
    return res;
  }

  private getSentence(): string[] {
    if (this.sentencesCopy.length === 0) {
      this.sentencesCopy = this.sentences.slice();
    }
    const idx = Math.floor(Math.random() * this.sentencesCopy.length);
    const sentence = this.sentencesCopy[idx];
    this.sentencesCopy.splice(idx, 1);
    return sentence;
  }

  private shouldReverseScroll(language: Language): boolean {
    return language === Language.ARABIC || language === Language.UYGHUR;
  }
}
