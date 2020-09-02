import { Injectable } from '@angular/core';
import { Language, WordMode } from '../models/Preference';

@Injectable({
  providedIn: 'root',
})
export abstract class WordService {
  abstract getWords(wordCount?: number): string[];

  abstract loadLanguage(language: Language, wordMode: WordMode): Promise<void>;

  abstract loadFile(file: File, wordMode: WordMode): Promise<void>;

  abstract addWordListListener(
    onUpdatedWordList: (wordMode: WordMode, wordListName: string, shouldReverseScroll: boolean) => void
  ): void;

  abstract addLanguageFetchListener(onLanguageFetch: (language: Language, promise: Promise<void>) => void): void;
}
