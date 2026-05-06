import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdPlaceholderComponent } from '../../ad-placeholder/ad-placeholder.component';

@Component({
  selector: 'app-prose-page',
  templateUrl: './prose-page.component.html',
  styleUrls: ['./prose-page.component.scss'],
  imports: [AdPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProsePageComponent {}
