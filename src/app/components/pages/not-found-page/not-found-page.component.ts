import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROSE_PAGE_IMPORTS } from '../prose-page/prose-page.imports';
import { ProsePageBase } from '../prose-page/prose-page-base';

@Component({
  templateUrl: './not-found-page.component.html',
  imports: PROSE_PAGE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent extends ProsePageBase {}
