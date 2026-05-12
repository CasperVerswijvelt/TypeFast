import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_EMAIL, MAILTO_HREF } from '../../../constants';
import { PageBylineComponent } from '../../shared/page-byline/page-byline.component';
import { ProsePageComponent } from '../prose-page/prose-page.component';

@Component({
  templateUrl: './terms-page.component.html',
  imports: [ProsePageComponent, PageBylineComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsPageComponent {
  readonly contactEmail = CONTACT_EMAIL;
  readonly mailtoHref = MAILTO_HREF;
}
