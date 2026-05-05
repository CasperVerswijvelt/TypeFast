import { Component, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterOutlet,
  TitleStrategy,
} from '@angular/router';
import { filter, skip } from 'rxjs/operators';
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
})
export class AppComponent {
  private readonly titleStrategy = inject(TitleStrategy);

  constructor(
    private readonly themeService: ThemeService,
    private readonly typerState: TyperStateService,
    private readonly router: Router,
  ) {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.router.events
        .pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd),
          skip(1),
        )
        .subscribe((e) => {
          const pageTitle =
            this.titleStrategy.buildTitle(this.router.routerState.snapshot) ??
            'TypeFast.io';
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
