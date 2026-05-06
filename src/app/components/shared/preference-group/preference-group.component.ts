import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-preference-group',
  templateUrl: './preference-group.component.html',
  styleUrls: ['./preference-group.component.scss'],
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferenceGroupComponent {
  readonly groupKey = input.required<string>();
  readonly currentOpen = input.required<string>();
  readonly title = input.required<string>();
  readonly valueText = input<string>('');
  readonly entriesClass = input<string>('');
  readonly valueCapitalize = input<boolean>(false);
  readonly toggled = output<string>();

  protected readonly isOpen = computed(
    () => this.currentOpen() === this.groupKey(),
  );

  private static nextId = 0;
  protected readonly entriesId =
    'pref-group-' + ++PreferenceGroupComponent.nextId;

  protected onToggle(): void {
    this.toggled.emit(this.groupKey());
  }
}
