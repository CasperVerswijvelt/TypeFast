import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageBylineComponent } from '../../shared/page-byline/page-byline.component';
import { ProsePageComponent } from '../prose-page/prose-page.component';
import { RelatedGuidesComponent } from '../../related-guides/related-guides.component';

@Component({
  templateUrl: './touch-typing-fundamentals-page.component.html',
  imports: [ProsePageComponent, PageBylineComponent, RouterLink, RelatedGuidesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TouchTypingFundamentalsPageComponent {}
