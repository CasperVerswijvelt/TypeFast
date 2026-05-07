import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProsePageComponent } from '../prose-page/prose-page.component';
import { RelatedGuidesComponent } from '../../related-guides/related-guides.component';

@Component({
  templateUrl: './touch-typing-fundamentals-page.component.html',
  imports: [ProsePageComponent, RouterLink, RelatedGuidesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TouchTypingFundamentalsPageComponent {}
