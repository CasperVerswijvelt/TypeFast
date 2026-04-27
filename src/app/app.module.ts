import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

import { AppComponent } from './components/app.component';
import { WordService } from './services/word.service';
import { TyperComponent } from './components/typer/typer.component';
import { TimePipe } from './pipes/time.pipe';
import { PreferencesService } from './services/preferences.service';
import { LanguageService } from './services/language.service';
import { PreferencesComponent } from './components/preferences/preferences.component';
import { ThemeService } from './services/theme.service';
import { PopperDirective } from './directives/popper.directive';
import { IncorrectWordComponent } from './components/incorrect-word/incorrect-word.component';
import { AboutComponent } from './components/about/about.component';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [
        AppComponent,
        TyperComponent,
        TimePipe,
        PreferencesComponent,
        PopperDirective,
        IncorrectWordComponent,
        AboutComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        MarkdownModule.forRoot({ loader: HttpClient })], providers: [WordService, PreferencesService, ThemeService, LanguageService, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {
  constructor(private themeService: ThemeService) {}
}
