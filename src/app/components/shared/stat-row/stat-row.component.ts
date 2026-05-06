import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PopperDirective } from '../../../directives/popper.directive';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tr[app-stat-row]',
  templateUrl: './stat-row.component.html',
  styleUrls: ['./stat-row.component.scss'],
  imports: [PopperDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatRowComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly valueCapitalize = input<boolean>(false);
  readonly titleHover = input<boolean>(false);
  readonly hasTooltip = input<boolean>(true);
}
