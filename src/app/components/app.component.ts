import { Component } from '@angular/core';
import { WordService } from '../services/word.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Type fast.';

  showAbout = false;

  private typeTestFocusFunction: () => void;

  onPreferencesToggled(show: boolean) {
    if (show === false && this.typeTestFocusFunction) {
      this.typeTestFocusFunction();
    }
  }

  onFocusFunctionReady(focusFunction: () => void) {
    if (focusFunction) {
      this.typeTestFocusFunction = focusFunction;
    }
  }

  preferencesAboutClicked() {
    this.showAbout = true;
    console.log(this.showAbout)
  }

  closeAbout() {
    this.showAbout = false;
    console.log(this.showAbout)
  }
}
