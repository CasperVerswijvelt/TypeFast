import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CONTACT_EMAIL,
  DISCORD_URL,
  GITHUB_ISSUES_URL,
  MAILTO_HREF,
} from '../../../constants';
import { PageBylineComponent } from '../../shared/page-byline/page-byline.component';
import { ProsePageComponent } from '../prose-page/prose-page.component';

@Component({
  templateUrl: './feedback-page.component.html',
  imports: [ProsePageComponent, PageBylineComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackPageComponent {
  readonly contactEmail = CONTACT_EMAIL;
  readonly mailtoHref = MAILTO_HREF;
  readonly discordUrl = DISCORD_URL;
  readonly githubIssuesUrl = GITHUB_ISSUES_URL;
}
