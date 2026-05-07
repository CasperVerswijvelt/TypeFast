import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_EMAIL, GITHUB_URL, MAILTO_HREF } from '../../../constants';
import { ProsePageComponent } from '../prose-page/prose-page.component';

@Component({
  templateUrl: './privacy-page.component.html',
  imports: [ProsePageComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPageComponent {
  readonly githubUrl = GITHUB_URL;
  readonly contactEmail = CONTACT_EMAIL;
  readonly mailtoHref = MAILTO_HREF;
}
