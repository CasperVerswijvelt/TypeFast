import { WritableSignal, signal } from '@angular/core';

// Read a JSON-encoded value from localStorage. Returns null on miss or parse
// failure. Caller is expected to gate on isPlatformBrowser before calling.
export function readJSON<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null;
  } catch {
    return null;
  }
}

// Write a JSON-encoded value to localStorage. Silently no-ops on
// serialization failure (quota exceeded, storage disabled).
export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// Bulk-create a record of WritableSignals from a defaults object. Each entry
// becomes a WritableSignal seeded with its default value. Useful when many
// similarly-shaped signals are derived from a config.
export function signalsFromDefaults<T extends object>(
  defaults: T,
): { [K in keyof T]: WritableSignal<T[K]> } {
  const result = {} as { [K in keyof T]: WritableSignal<T[K]> };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    result[key] = signal(defaults[key]) as WritableSignal<T[keyof T]>;
  }
  return result;
}
