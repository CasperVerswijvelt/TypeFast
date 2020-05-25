import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class WordService {

  abstract getWords(shuffle?: boolean, wordCount? : number): string[];

  abstract reprocessWordList() :void;

  abstract reloadWordList() :void;

  abstract loadWordListUrl(url: string) : Promise<void>;

  abstract loadWordListLocal(file: File) :  void;

  abstract addListener(listenerFunction: () => void) : void;
}
