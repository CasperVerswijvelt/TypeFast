import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { GUIDES } from '../pages/guides';

@Component({
  selector: 'app-related-guides',
  templateUrl: './related-guides.component.html',
  styleUrls: ['./related-guides.component.scss'],
  imports: [RouterLink],
  host: {
    '[class.is-compact]': 'compact()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedGuidesComponent {
  readonly currentSlug = input<string | undefined>(undefined);
  // Optional heading. Pass an empty string to omit the heading entirely
  // (useful when the surrounding prose already introduces the cards).
  readonly heading = input<string>('More guides');
  // Compact variant hides the long summary and tightens padding —
  // suited for an inline "skip ahead" block near the top of a page.
  readonly compact = input<boolean>(false);
  // Desktop column count. Mobile is always single-column.
  readonly columns = input<2 | 3>(2);

  readonly guides = computed(() => {
    const current = this.currentSlug();
    return GUIDES.filter((g) => g.slug !== current);
  });
}
