import { Component } from '@angular/core';
import {
  CONTACT_EMAIL,
  DISCORD_URL,
  GITHUB_ISSUES_URL,
  MAILTO_HREF,
} from '../../../constants';
import { PROSE_PAGE_IMPORTS } from '../prose-page/prose-page.imports';

@Component({
  selector: 'app-feedback-page',
  templateUrl: './feedback-page.component.html',
  imports: PROSE_PAGE_IMPORTS,
})
export class FeedbackPageComponent {
  readonly contactEmail = CONTACT_EMAIL;
  readonly mailtoHref = MAILTO_HREF;
  readonly discordUrl = DISCORD_URL;
  readonly githubIssuesUrl = GITHUB_ISSUES_URL;
}
