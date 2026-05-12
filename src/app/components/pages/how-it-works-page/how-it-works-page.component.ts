import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageBylineComponent } from '../../shared/page-byline/page-byline.component';
import { ProsePageComponent } from '../prose-page/prose-page.component';

@Component({
  templateUrl: './how-it-works-page.component.html',
  imports: [ProsePageComponent, PageBylineComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorksPageComponent {}
