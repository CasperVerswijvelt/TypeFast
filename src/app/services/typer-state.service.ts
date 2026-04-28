import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TyperStateService {
  readonly running = signal(false);

  private focusFn: (() => void) | null = null;

  register(fn: () => void): void {
    this.focusFn = fn;
  }

  unregister(fn: () => void): void {
    if (this.focusFn === fn) this.focusFn = null;
  }

  requestFocus(): void {
    this.focusFn?.();
  }
}
