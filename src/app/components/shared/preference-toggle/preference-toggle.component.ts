import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-preference-toggle',
  templateUrl: './preference-toggle.component.html',
  styleUrls: ['./preference-toggle.component.scss'],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class PreferenceToggleComponent {
  readonly label = input.required<string>();
  readonly value = input.required<boolean>();
  readonly extraClass = input<string>('');
  readonly mainEntry = input<boolean>(true);
  readonly toggled = output<boolean>();

  protected readonly hostClasses = computed(() => {
    const classes = ['preferences-entry', 'preferences-toggle-entry'];
    if (this.mainEntry()) classes.push('preferences-entry-main');
    const extra = this.extraClass();
    if (extra) classes.push(extra);
    return classes.join(' ');
  });

  private static nextId = 0;
  protected readonly inputId =
    'pref-toggle-' + ++PreferenceToggleComponent.nextId;

  protected onChange(event: Event): void {
    this.toggled.emit((event.target as HTMLInputElement).checked);
  }
}
