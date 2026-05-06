import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  effect,
  inject,
  signal,
} from '@angular/core';
import { PreferencesService } from './preferences.service';
import { Theme } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly prefs = inject(PreferencesService);

  private readonly systemPrefersDark = signal(false);

  constructor() {
    if (this.isBrowser) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPrefersDark.set(mql.matches);

      const handler = (event: MediaQueryListEvent) =>
        this.systemPrefersDark.set(event.matches);

      // Safari pre-14 still requires the deprecated addListener API.
      if (mql.addEventListener) {
        mql.addEventListener('change', handler);
        this.destroyRef.onDestroy(() =>
          mql.removeEventListener('change', handler),
        );
      } else if (mql.addListener) {
        mql.addListener(handler);
        this.destroyRef.onDestroy(() => mql.removeListener(handler));
      }
    }

    effect(() => {
      const themePref = this.prefs.theme();
      const followSystem = this.prefs.followSystemTheme();
      const systemDark = this.systemPrefersDark();
      this.applyTheme(
        followSystem ? (systemDark ? Theme.DARK : themePref) : themePref,
      );
    });
  }

  setTheme(theme: Theme): void {
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    if (this.document.body) {
      this.document.body.className = `theme--${theme as string}`;
    }
  }
}
