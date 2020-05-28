import { Injectable } from '@angular/core';
import { TextFormat } from '../models/TextSource';
import { Language, WordMode } from '../models/Preference';


@Injectable({
  providedIn: 'root',
})
export abstract class WordService {
  abstract getWords(wordCount?: number): string[];

  abstract getSentence(): string[];

  abstract loadLanguage(language: Language): Promise<[void,void]>

  abstract loadFile(file : File) : Promise<void>;

  abstract addWordListListener(onUpdatedWordList: (wordMode : WordMode, wordListName : string) => void): void;

  abstract addLanguageFetchListener(onLanguageFetch : (language: Language, promise : Promise<void>) => void): void;
}
