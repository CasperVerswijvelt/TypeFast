import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterOutlet,
  TitleStrategy,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, skip } from 'rxjs/operators';
import { SITE_NAME } from '../constants';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { ThemeService } from '../services/theme.service';
import { TyperStateService } from '../services/typer-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, NavComponent, FooterComponent, PreferencesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly titleStrategy = inject(TitleStrategy);
  private readonly router = inject(Router);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly typerState = inject(TyperStateService);

  // ThemeService is instantiated for its side effects (applying the theme
  // class to <body>); the reference itself is unused.
  private readonly _themeService = inject(ThemeService);

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const navEnd$ = this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      );

      // app-root is the scroll container (see styles.scss), so Angular's
      // built-in scrollPositionRestoration on `window` is a no-op here.
      // Reset on every nav unless there's a fragment (anchor scrolling).
      navEnd$.subscribe(() => {
        if (!this.router.routerState.snapshot.root.fragment) {
          this.host.nativeElement.scrollTo({ top: 0, left: 0 });
        }
      });

      navEnd$.pipe(skip(1)).subscribe((e) => {
        const pageTitle =
          this.titleStrategy.buildTitle(this.router.routerState.snapshot) ??
          SITE_NAME;
        const w = window as unknown as {
          Shynet?: { newPageLoad?: () => void };
          gtag?: (...args: unknown[]) => void;
        };
        w.Shynet?.newPageLoad?.();
        w.gtag?.('event', 'page_view', {
          page_path: e.urlAfterRedirects,
          page_location: window.location.href,
          page_title: pageTitle,
        });
      });
    }
  }

  onPreferencesToggled(show: boolean): void {
    if (show === false) {
      this.typerState.requestFocus();
    }
  }
}
