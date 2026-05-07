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
const STORAGE_KEY = 'preferences';

function parseJSON<T>(raw: string | null): T | null {
  try {
    return JSON.parse(raw ?? 'null') as T | null;
  } catch {
    return null;
  }
}

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

  private readonly signals: SignalMap = Object.fromEntries(
    Object.entries(this.defaults).map(([k, v]) => [k, signal(v)]),
  ) as SignalMap;

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
    const stored = parseJSON<Preferences>(localStorage.getItem(STORAGE_KEY));
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
      const pref =
        parseJSON<Preferences>(localStorage.getItem(STORAGE_KEY)) ?? {};
      (pref as Record<string, unknown>)[key] = value;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
      } catch {
        // ignore quota / disabled-storage failures
      }
    }

    (this.signals[key] as WritableSignal<unknown>).set(value);
  }

  clearPreferences(): void {
    if (this.isBrowser && localStorage.getItem(STORAGE_KEY) !== null) {
      localStorage.removeItem(STORAGE_KEY);
      for (const key of Object.keys(this.defaults) as Preference[]) {
        (this.signals[key] as WritableSignal<unknown>).set(this.defaults[key]);
      }
    }
  }

  private onStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return;

    const oldObj = parseJSON<Preferences>(event.oldValue);
    const newObj = parseJSON<Preferences>(event.newValue);
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
  }
}
