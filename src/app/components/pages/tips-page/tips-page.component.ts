import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROSE_PAGE_IMPORTS } from '../prose-page/prose-page.imports';

@Component({
  selector: 'app-tips-page',
  templateUrl: './tips-page.component.html',
  imports: PROSE_PAGE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipsPageComponent {}
