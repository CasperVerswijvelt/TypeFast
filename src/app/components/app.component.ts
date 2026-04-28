import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { ThemeService } from '../services/theme.service';
import { TyperStateService } from '../services/typer-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, NavComponent, PreferencesComponent],
})
export class AppComponent {
  constructor(
    private readonly themeService: ThemeService,
    private readonly typerState: TyperStateService,
  ) {}

  onPreferencesToggled(show: boolean): void {
    if (show === false) {
      this.typerState.requestFocus();
    }
  }
}
