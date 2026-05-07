import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_EMAIL, MAILTO_HREF } from '../../../constants';
import { ProsePageComponent } from '../prose-page/prose-page.component';

@Component({
  templateUrl: './about-page.component.html',
  imports: [ProsePageComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPageComponent {
  readonly contactEmail = CONTACT_EMAIL;
  readonly mailtoHref = MAILTO_HREF;
}
