import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AUTHOR_NAME } from '../../../constants';

@Component({
  selector: 'app-page-byline',
  templateUrl: './page-byline.component.html',
  styleUrls: ['./page-byline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBylineComponent {
  @Input({ required: true }) lastUpdated!: string;
  readonly author = AUTHOR_NAME;
}
