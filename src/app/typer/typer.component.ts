import { Component, OnInit } from '@angular/core';
import { WordService } from '../word.service';
import { TestResults } from './TestResults';

@Component({
  selector: 'app-typer',
  templateUrl: './typer.component.html',
  styleUrls: ['./typer.component.scss']
})

export class TyperComponent implements OnInit {


  words : string[];
  currentIndex : number;
  wordInput : string;
  leftOffset : number = 0;

  currentWordElement: HTMLElement;
  containerElement: HTMLElement;
  inputElement: HTMLInputElement;


  testResults : TestResults;


  constructor(private wordService : WordService) { }

  ngOnInit(): void {
    this.containerElement = document.getElementsByClassName('word-container')[0] as HTMLElement;
    this.inputElement = document.getElementsByClassName('word-input')[0] as HTMLInputElement;
    
    this.inputElement.focus();
    this.inputElement.select();

    this.inputElement.onpaste = (e) => e.preventDefault();

    this.setupTest()
  }

  setupTest() {

    this.currentIndex = 0;
    this.words = this.wordService.getWords(true, 100);
    this.testResults = {
      correctCharacterCount: 0,
      incorrectCharacterCount: 0,
      correctWordCount: 0,
      incorrectWordCount: 0,
      incorrectWords: []
    };
  }

  wordInputChanged (word : string) {

    this.wordInput = this.wordInput.trim();
    
    this.syncCurrentWordElement();

    if (word[word.length-1] == ' ') {
      
      //Space typed, validate word
      this.registerWord(this.wordInput, this.words[this.currentIndex]);

      this.nextWord();
      
    } else {
      if (this.words[this.currentIndex].slice(0, this.wordInput.length) !== this.wordInput) {

        this.inputElement.classList.add("input-incorrect");

      } else {
        
        this.inputElement.classList.remove("input-incorrect");
      }
    }
  }

  nextWord() {

    this.currentIndex ++;
    this.wordInput = '';

    this.leftOffset = this.leftOffset + this.currentWordElement.getBoundingClientRect().width;;
    this.syncCurrentWordElement();
    this.syncLeft();
   
  }

  registerWord(value:string, expected: string) {

    if (value === expected) {

      this.currentWordElement.classList.add('word-correct');
      this.testResults.correctWordCount++;

    } else {

      this.testResults.incorrectWords.push({
        expected:expected,
        value: value
      })
      this.currentWordElement.classList.add('word-incorrect');
      this.testResults.incorrectWordCount++;
    }

    let correctCharacters = 1;
    let incorrectCharacters = 0;
    
    let length = Math.min(value.length, expected.length)
    
    incorrectCharacters += Math.abs(value.length - expected.length);

    for(let i = 0; i < length; i++) {
      if (value[i] === expected[i]) {

        correctCharacters++;

      } else {

        incorrectCharacters++;
      }
    }

    this.testResults.correctCharacterCount += correctCharacters;
    this.testResults.incorrectCharacterCount += incorrectCharacters;
  }

  syncCurrentWordElement() {

    this.currentWordElement = this.containerElement.children[this.currentIndex] as HTMLElement;
  }

  syncLeft() {
    this.containerElement.style.left = `calc(50% - 3em - ${this.leftOffset}px)`;
  }
}
