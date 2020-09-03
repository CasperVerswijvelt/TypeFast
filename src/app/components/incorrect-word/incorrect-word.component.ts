import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-incorrect-word',
  templateUrl: './incorrect-word.component.html',
  styleUrls: ['./incorrect-word.component.scss'],
})
export class IncorrectWordComponent implements OnInit {
  @Input() value: string;
  @Input() expected: string;

  valueLetters = [];

  constructor() {}

  ngOnInit(): void {
    for (
      let i = 0;
      i < Math.min(this.value.length, this.expected.length);
      i++
    ) {
      let entry = {
        char: this.value[i],
        class: 'character-incorrect',
      };

      if (this.value[i] === this.expected[i]) {
        entry.class = 'character-correct';
      }

      this.valueLetters.push(entry);
    }

    if (this.value.length > this.expected.length) {
      // append last letters of value, marked incorrect
      this.valueLetters = this.valueLetters.concat(
        this.value
          .slice(this.expected.length, this.value.length)
          .split('')
          .map((el) => {
            return {
              char: el,
              class: 'character-incorrect',
            };
          })
      );
    } else if (this.value.length < this.expected.length) {
      // append last letters of expected value, marked missing
      this.valueLetters = this.valueLetters.concat(
        this.expected
          .slice(this.value.length, this.expected.length)
          .split('')
          .map((el) => {
            return {
              char: el,
              class: 'character-missing',
            };
          })
      );
    }
  }
}
