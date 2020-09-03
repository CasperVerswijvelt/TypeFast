import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

import { AppComponent } from './components/app.component';
import { WordService } from './services/word.service';
import { TyperComponent } from './components/typer/typer.component';
import { TimePipe } from './pipes/time.pipe';
import { PreferencesService } from './services/preferences.service';
import { PreferencesComponent } from './components/preferences/preferences.component';
import { ThemeService } from './services/theme.service';
import { PopperDirective } from './directives/popper.directive';
import { IncorrectWordComponent } from './components/incorrect-word/incorrect-word.component';
import { AboutComponent } from './components/about/about.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    TyperComponent,
    TimePipe,
    PreferencesComponent,
    PopperDirective,
    IncorrectWordComponent,
    AboutComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
  ],
  providers: [WordService, PreferencesService, ThemeService],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private themeService: ThemeService) {}
}
