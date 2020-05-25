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

  abstract loadTextViaUrl(format: TextFormat, url: string): Promise<boolean>;

  abstract loadTextViaFile(format: TextFormat, file: File): Promise<boolean>;

  abstract addListener(listenerFunction: () => void): void;
}
