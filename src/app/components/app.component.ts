import { Component } from '@angular/core';
import { TyperComponent } from './typer/typer.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { AboutComponent } from './about/about.component';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [TyperComponent, PreferencesComponent, AboutComponent],
})
export class AppComponent {
  title = 'Type fast.';

  showAbout = false;

  private typeTestFocusFunction: () => void;

  constructor(private readonly themeService: ThemeService) {}

  onPreferencesToggled(show: boolean): void {
    if (show === false && this.typeTestFocusFunction) {
      this.typeTestFocusFunction();
    }
  }

  onFocusFunctionReady(focusFunction: () => void): void {
    if (focusFunction) {
      this.typeTestFocusFunction = focusFunction;
    }
  }

  preferencesAboutClicked(): void {
    this.showAbout = true;
  }

  closeAbout(): void {
    this.showAbout = false;
  }
}
