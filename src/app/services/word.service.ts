import { Injectable } from '@angular/core';
import { TextFormat } from '../models/TextSource';
import { Language } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export abstract class WordService {
  abstract getWords(wordCount?: number): string[];

  abstract getSentence(): string[];

  abstract loadLanguage(language: Language): Promise<[boolean,boolean]>

  abstract loadFile(file : File) : Promise<void>;

  abstract addListener(listenerFunction: () => void): void;
}
