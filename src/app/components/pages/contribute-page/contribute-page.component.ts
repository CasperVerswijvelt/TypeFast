import { Component } from '@angular/core';
import { GITHUB_URL } from '../../../constants';
import { PROSE_PAGE_IMPORTS } from '../prose-page/prose-page.imports';

@Component({
  selector: 'app-contribute-page',
  templateUrl: './contribute-page.component.html',
  imports: PROSE_PAGE_IMPORTS,
})
export class ContributePageComponent {
  readonly githubUrl = GITHUB_URL;
}
