import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TyperStateService } from '../../services/typer-state.service';
import { FooterComponent } from '../footer/footer.component';

interface NavLink {
  path: string;
  label: string;
  cta?: boolean;
  // When present, the entry behaves as a hover-dropdown on desktop.
  // The mobile overlay only shows the parent — sub-pages are reached
  // through the /tips hub page.
  children?: { path: string; label: string }[];
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  imports: [RouterLink, RouterLinkActive, FooterComponent],
  host: {
    '[class.dimmed]': 'state.running()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent {
  state = inject(TyperStateService);

  links: NavLink[] = [
    { path: '/test', label: 'start typing', cta: true },
    {
      path: '/tips',
      label: 'guides',
      children: [
        { path: '/tips', label: 'tips overview' },
        {
          path: '/touch-typing-fundamentals',
          label: 'touch typing fundamentals',
        },
        { path: '/keyboard-layouts', label: 'keyboard layouts' },
        { path: '/practice-routines', label: 'practice routines' },
      ],
    },
    { path: '/how-it-works', label: 'how-it-works' },
    { path: '/about', label: 'about' },
  ];

  menuOpen = signal(false);

  // Suppresses the desktop guides dropdown after a sub-link click. CSS
  // alone keeps it open while the cursor is still over the panel; this
  // flag force-closes it until mouseleave clears it.
  dropdownSuppressed = signal(false);

  // Bubbles up to AppComponent, which forwards to the PreferencesComponent
  // dialog. Keeps the trigger inline with the nav and the dialog mounted
  // at the app shell.
  readonly settingsClicked = output<void>();

  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      this.document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  // After clicking a sub-link, suppress the dropdown and blur the link
  // so :focus-within stops holding it open. The user's cursor is likely
  // still over the panel; mouseleave on the group will lift the
  // suppression so future hovers work normally again.
  closeDropdown(ev: Event): void {
    this.dropdownSuppressed.set(true);
    (ev.currentTarget as HTMLElement | null)?.blur();
  }

  releaseDropdown(): void {
    this.dropdownSuppressed.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.closeMenu();
  }
}
