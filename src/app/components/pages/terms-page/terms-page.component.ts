import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CONTACT_EMAIL, MAILTO_HREF } from '../../../constants';
import { PROSE_PAGE_IMPORTS } from '../prose-page/prose-page.imports';

@Component({
  selector: 'app-terms-page',
  templateUrl: './terms-page.component.html',
  imports: PROSE_PAGE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsPageComponent {
  readonly contactEmail = CONTACT_EMAIL;
  readonly mailtoHref = MAILTO_HREF;
}
