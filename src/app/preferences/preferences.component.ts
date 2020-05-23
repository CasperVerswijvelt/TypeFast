import { Component, OnInit } from '@angular/core';
import { PreferencesService } from '../preferences.service';
import { Preference, Language } from '../Preference';
import { WordService } from '../word.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {

  showPreferences = false;
  Language = Language;

  useDarkMode : boolean;
  language : Language;

  constructor(private preferencesService : PreferencesService, private wordService : WordService) { 
    this.useDarkMode = preferencesService.getPreference(Preference.DARK_MODE);
    this.language = preferencesService.getPreference(Preference.LANGUAGE);
  }

  ngOnInit(): void {
  }

  onPreferencesIconClicked() {

    this.togglePreferences();
  }

  togglePreferences() {
    this.showPreferences = !this.showPreferences;
  }

  onDarkModeChanged() {
    this.preferencesService.setPreference(Preference.DARK_MODE, this.useDarkMode);
  }

  onLanguageChanged() {
    this.preferencesService.setPreference(Preference.LANGUAGE, this.language);
    this.wordService.loadWordList();
  }
}
