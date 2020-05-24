import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WordService } from './word.service';
import { DefaultWordService } from './default-word.service';
import { TyperComponent } from './typer/typer.component';
import { TimePipe } from './time.pipe';
import { PreferencesService } from './preferences.service';
import { PreferencesComponent } from './preferences/preferences.component';
import { ThemeService } from './theme.service';

@NgModule({
  declarations: [AppComponent, TyperComponent, TimePipe, PreferencesComponent],
  imports: [BrowserModule, FormsModule],
  providers: [
    { provide: WordService, useClass: DefaultWordService },
    PreferencesService,
    ThemeService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
