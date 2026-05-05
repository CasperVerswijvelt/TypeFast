import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TyperStateService } from '../../services/typer-state.service';

interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  imports: [RouterLink, RouterLinkActive],
  host: {
    '[class.dimmed]': 'state.running()',
  },
})
export class NavComponent {
  state = inject(TyperStateService);

  links: NavLink[] = [
    { path: '/test', label: 'test' },
    { path: '/about', label: 'about' },
    { path: '/how-it-works', label: 'how-it-works' },
    { path: '/tips', label: 'tips' },
    { path: '/privacy', label: 'privacy' },
    { path: '/terms', label: 'terms' },
    { path: '/changelog', label: 'changelog' },
    { path: '/contribute', label: 'contribute' },
    { path: '/feedback', label: 'feedback' },
  ];

  menuOpen = signal(false);

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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.closeMenu();
  }
}
