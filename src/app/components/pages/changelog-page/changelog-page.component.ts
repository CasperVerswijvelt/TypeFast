import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { ProsePageComponent } from '../prose-page/prose-page.component';

@Component({
  selector: 'app-changelog-page',
  templateUrl: './changelog-page.component.html',
  imports: [ProsePageComponent, MarkdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangelogPageComponent {}
