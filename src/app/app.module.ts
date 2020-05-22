import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WordService } from './word.service';
import { DefaultWordService } from './default-word.service';
import { TyperComponent } from './typer/typer.component';

@NgModule({
  declarations: [
    AppComponent,
    TyperComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    { provide: WordService, useClass: DefaultWordService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
