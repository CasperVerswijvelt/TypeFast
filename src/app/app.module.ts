import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './components/app.component';
import { WordService } from './services/word.service';
import { DefaultWordService } from './services/default-word.service';
import { TyperComponent } from './components/typer/typer.component';
import { TimePipe } from './pipes/time.pipe';
import { PreferencesService } from './services/preferences.service';
import { PreferencesComponent } from './components/preferences/preferences.component';
import { ThemeService } from './services/theme.service';
import { PopperDirective } from './popper.directive';

@NgModule({
  declarations: [AppComponent, TyperComponent, TimePipe, PreferencesComponent, PopperDirective],
  imports: [BrowserModule, FormsModule],
  providers: [
    { provide: WordService, useClass: DefaultWordService },
    PreferencesService,
    ThemeService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
