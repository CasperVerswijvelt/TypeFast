import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProsePageComponent } from '../prose-page/prose-page.component';
import { CHANGELOG_HTML } from './changelog.generated';

@Component({
  templateUrl: './changelog-page.component.html',
  imports: [ProsePageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangelogPageComponent {
  // Generated at build time from CHANGELOG.md by scripts/generate-changelog.mjs.
  // Treated as trusted because the source is checked into the repo.
  readonly html = CHANGELOG_HTML;
}
