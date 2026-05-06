import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { Language } from 'src/app/models/Preference';
import { LanguageService } from 'src/app/services/language.service';

interface Letter {
  char: string;
  class: 'character-correct' | 'character-incorrect' | 'character-missing';
}

@Component({
  selector: 'app-incorrect-word',
  templateUrl: './incorrect-word.component.html',
  styleUrls: ['./incorrect-word.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class IncorrectWordComponent {
  readonly value = input.required<string>();
  readonly expected = input.required<string>();
  readonly language = input.required<Language>();
  readonly ignoreAccentedCharacters = input.required<boolean>();
  readonly ignoreCasing = input.required<boolean>();

  readonly valueLetters = computed<Letter[]>(() => {
    const value = this.ignoreCasing()
      ? this.value().toLowerCase()
      : this.value();
    const expected = this.ignoreCasing()
      ? this.expected().toLowerCase()
      : this.expected();

    const letters: Letter[] = [];

    const sharedLength = Math.min(value.length, expected.length);
    for (let i = 0; i < sharedLength; i++) {
      const correct = LanguageService.compare(
        value[i],
        expected[i],
        this.language(),
        this.ignoreAccentedCharacters(),
      );
      letters.push({
        char: value[i],
        class: correct ? 'character-correct' : 'character-incorrect',
      });
    }

    if (value.length > expected.length) {
      // Extra characters typed beyond the expected word — mark incorrect.
      for (const ch of value.slice(expected.length)) {
        letters.push({ char: ch, class: 'character-incorrect' });
      }
    } else if (value.length < expected.length) {
      // Characters the user never typed — show as missing.
      for (const ch of expected.slice(value.length)) {
        letters.push({ char: ch, class: 'character-missing' });
      }
    }

    return letters;
  });
}
