import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ad-placeholder',
  templateUrl: './ad-placeholder.component.html',
  styleUrls: ['./ad-placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdPlaceholderComponent {
  readonly size = input<'banner' | 'banner-slim' | 'rectangle'>('banner');
  readonly label = input('Ad placeholder');

  readonly visible = environment.showAdPlaceholders;
}
