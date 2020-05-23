import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class WordService {

  abstract getWords(shuffle?: boolean, wordCount? : number): string[];

  abstract loadWordList(url?: string) : Promise<void>;

  abstract addListener(listenerFunction: () => void) : void;
}
