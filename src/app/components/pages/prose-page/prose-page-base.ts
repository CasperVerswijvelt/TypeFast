import {
  CONTACT_EMAIL,
  DISCORD_URL,
  GITHUB_ISSUES_URL,
  GITHUB_URL,
  MAILTO_HREF,
} from '../../../constants';

// Shared base for routed prose-style pages. Exposes the small set of
// outbound URLs and contact strings that show up across about/privacy/
// terms/contribute/feedback templates so each page no longer needs to
// re-import and re-declare them.
export abstract class ProsePageBase {
  readonly contactEmail = CONTACT_EMAIL;
  readonly mailtoHref = MAILTO_HREF;
  readonly discordUrl = DISCORD_URL;
  readonly githubUrl = GITHUB_URL;
  readonly githubIssuesUrl = GITHUB_ISSUES_URL;
}
