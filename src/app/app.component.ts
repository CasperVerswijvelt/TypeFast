import { Component } from '@angular/core';
import { WordService } from './word.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Type fast.';

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
}
