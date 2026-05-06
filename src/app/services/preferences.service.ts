import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  Signal,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import {
  Preference,
  PreferenceValueMap,
  Preferences,
  Language,
  Theme,
  WordMode,
  TextSize,
} from '../models/Preference';

type SignalMap = { [K in Preference]: WritableSignal<PreferenceValueMap[K]> };

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private readonly defaults: PreferenceValueMap = {
    [Preference.THEME]: Theme.DARK,
    [Preference.LANGUAGE]: Language.ENGLISH_AMERICAN,
    [Preference.FOLLOW_SYSTEM_THEME]: false,
    [Preference.WORD_MODE]: WordMode.WORDS,
    [Preference.REVERSE_SCROLL]: false,
    [Preference.DEFAULT_TEST_DURATION]: 60,
    [Preference.TEXT_SIZE]: TextSize.MEDIUM,
    [Preference.SMOOTH_SCROLLING]: true,
    [Preference.SCROLLING_ANIMATION]: true,
    [Preference.IGNORE_DIACRITICS]: false,
    [Preference.IGNORE_CASING]: false,
    [Preference.HIDE_TIMER]: false,
    [Preference.HIDE_LIVE_STATS]: false,
  };

  private readonly preferenceTypes: Record<Preference, unknown> = {
    [Preference.THEME]: Theme,
    [Preference.LANGUAGE]: Language,
    [Preference.FOLLOW_SYSTEM_THEME]: 'boolean',
    [Preference.WORD_MODE]: WordMode,
    [Preference.REVERSE_SCROLL]: 'boolean',
    [Preference.DEFAULT_TEST_DURATION]: 'number',
    [Preference.TEXT_SIZE]: TextSize,
    [Preference.SMOOTH_SCROLLING]: 'boolean',
    [Preference.SCROLLING_ANIMATION]: 'boolean',
    [Preference.IGNORE_DIACRITICS]: 'boolean',
    [Preference.IGNORE_CASING]: 'boolean',
    [Preference.HIDE_TIMER]: 'boolean',
    [Preference.HIDE_LIVE_STATS]: 'boolean',
  };

  private readonly signals: SignalMap = {
    [Preference.THEME]: signal(this.defaults[Preference.THEME]),
    [Preference.LANGUAGE]: signal(this.defaults[Preference.LANGUAGE]),
    [Preference.FOLLOW_SYSTEM_THEME]: signal(
      this.defaults[Preference.FOLLOW_SYSTEM_THEME],
    ),
    [Preference.WORD_MODE]: signal(this.defaults[Preference.WORD_MODE]),
    [Preference.REVERSE_SCROLL]: signal(
      this.defaults[Preference.REVERSE_SCROLL],
    ),
    [Preference.DEFAULT_TEST_DURATION]: signal(
      this.defaults[Preference.DEFAULT_TEST_DURATION],
    ),
    [Preference.TEXT_SIZE]: signal(this.defaults[Preference.TEXT_SIZE]),
    [Preference.SMOOTH_SCROLLING]: signal(
      this.defaults[Preference.SMOOTH_SCROLLING],
    ),
    [Preference.SCROLLING_ANIMATION]: signal(
      this.defaults[Preference.SCROLLING_ANIMATION],
    ),
    [Preference.IGNORE_DIACRITICS]: signal(
      this.defaults[Preference.IGNORE_DIACRITICS],
    ),
    [Preference.IGNORE_CASING]: signal(this.defaults[Preference.IGNORE_CASING]),
    [Preference.HIDE_TIMER]: signal(this.defaults[Preference.HIDE_TIMER]),
    [Preference.HIDE_LIVE_STATS]: signal(
      this.defaults[Preference.HIDE_LIVE_STATS],
    ),
  };

  // Typed read-only signal accessors. Templates and effects bind to these
  // directly: prefs.theme(), prefs.ignoreCasing(), etc.
  readonly theme: Signal<Theme> = this.signals[Preference.THEME].asReadonly();
  readonly language: Signal<Language> =
    this.signals[Preference.LANGUAGE].asReadonly();
  readonly followSystemTheme: Signal<boolean> =
    this.signals[Preference.FOLLOW_SYSTEM_THEME].asReadonly();
  readonly wordMode: Signal<WordMode> =
    this.signals[Preference.WORD_MODE].asReadonly();
  readonly reverseScroll: Signal<boolean> =
    this.signals[Preference.REVERSE_SCROLL].asReadonly();
  readonly defaultTestDuration: Signal<number> =
    this.signals[Preference.DEFAULT_TEST_DURATION].asReadonly();
  readonly textSize: Signal<TextSize> =
    this.signals[Preference.TEXT_SIZE].asReadonly();
  readonly smoothScrolling: Signal<boolean> =
    this.signals[Preference.SMOOTH_SCROLLING].asReadonly();
  readonly scrollingAnimation: Signal<boolean> =
    this.signals[Preference.SCROLLING_ANIMATION].asReadonly();
  readonly ignoreDiacritics: Signal<boolean> =
    this.signals[Preference.IGNORE_DIACRITICS].asReadonly();
  readonly ignoreCasing: Signal<boolean> =
    this.signals[Preference.IGNORE_CASING].asReadonly();
  readonly hideTimer: Signal<boolean> =
    this.signals[Preference.HIDE_TIMER].asReadonly();
  readonly hideLiveStats: Signal<boolean> =
    this.signals[Preference.HIDE_LIVE_STATS].asReadonly();

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageHandler = (event: StorageEvent) =>
    this.onStorage(event);

  constructor() {
    if (this.isBrowser) {
      window.addEventListener('storage', this.storageHandler, false);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('storage', this.storageHandler, false);
      });
      this.retrievePreferences();
    }
  }

  private retrievePreferences() {
    try {
      const stored = JSON.parse(
        localStorage.getItem('preferences') ?? 'null',
      ) as Preferences | null;
      if (!stored) return;

      for (const key of Object.keys(stored) as Preference[]) {
        const value = stored[key];
        if (
          value !== undefined &&
          this.validatePreferenceType(key, value) &&
          !this.isTemporaryPreference(key, value)
        ) {
          (this.signals[key] as WritableSignal<unknown>).set(value);
        }
      }
    } catch {
      // localStorage parse failed — fall back to defaults
    }
  }

  private validatePreferenceType(key: Preference, value: unknown): boolean {
    const type = this.preferenceTypes[key];
    return (
      typeof type === 'undefined' ||
      (typeof type === 'string'
        ? typeof value === type
        : Object.values(type as Record<string, unknown>).includes(value))
    );
  }

  private isTemporaryPreference(key: Preference, value: unknown): boolean {
    return key === Preference.LANGUAGE && value === Language.CUSTOM;
  }

  preference<K extends Preference>(key: K): Signal<PreferenceValueMap[K]> {
    return this.signals[key].asReadonly() as Signal<PreferenceValueMap[K]>;
  }

  getPreference<K extends Preference>(key: K): PreferenceValueMap[K] {
    return this.signals[key]() as PreferenceValueMap[K];
  }

  setPreference<K extends Preference>(
    key: K,
    value: PreferenceValueMap[K],
  ): void {
    if (!this.validatePreferenceType(key, value)) return;

    if (this.isBrowser && !this.isTemporaryPreference(key, value)) {
      let pref: Preferences;
      try {
        pref =
          (JSON.parse(
            localStorage.getItem('preferences') ?? 'null',
          ) as Preferences | null) ?? {};
      } catch {
        pref = {};
      }
      (pref as Record<string, unknown>)[key] = value;
      localStorage.setItem('preferences', JSON.stringify(pref));
    }

    (this.signals[key] as WritableSignal<unknown>).set(value);
  }

  clearPreferences(): void {
    if (this.isBrowser && localStorage.getItem('preferences') !== null) {
      localStorage.removeItem('preferences');
      for (const key of Object.keys(this.defaults) as Preference[]) {
        (this.signals[key] as WritableSignal<unknown>).set(this.defaults[key]);
      }
    }
  }

  private onStorage(event: StorageEvent) {
    if (event.key !== 'preferences') return;
    try {
      const oldObj = JSON.parse(event.oldValue ?? 'null') as Preferences | null;
      const newObj = JSON.parse(event.newValue ?? 'null') as Preferences | null;
      if (!newObj) return;

      for (const key of Object.keys(this.defaults) as Preference[]) {
        const newVal = newObj[key];
        if (
          newVal !== undefined &&
          oldObj?.[key] !== newVal &&
          this.validatePreferenceType(key, newVal) &&
          !this.isTemporaryPreference(key, newVal)
        ) {
          (this.signals[key] as WritableSignal<unknown>).set(newVal);
        }
      }
    } catch {
      // Empty
    }
  }
}
