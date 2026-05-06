import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GITHUB_URL } from '../../../constants';
import { PROSE_PAGE_IMPORTS } from '../prose-page/prose-page.imports';

@Component({
  selector: 'app-privacy-page',
  templateUrl: './privacy-page.component.html',
  imports: PROSE_PAGE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPageComponent {
  readonly githubUrl = GITHUB_URL;
}
