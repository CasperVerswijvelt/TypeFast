import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GITHUB_URL } from '../../../constants';
import { PageBylineComponent } from '../../shared/page-byline/page-byline.component';
import { ProsePageComponent } from '../prose-page/prose-page.component';

@Component({
  templateUrl: './contribute-page.component.html',
  imports: [ProsePageComponent, PageBylineComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContributePageComponent {
  readonly githubUrl = GITHUB_URL;
}
