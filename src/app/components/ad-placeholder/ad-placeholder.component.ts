import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ad-placeholder',
  templateUrl: './ad-placeholder.component.html',
  styleUrls: ['./ad-placeholder.component.scss'],
})
export class AdPlaceholderComponent {
  @Input() size: 'banner' | 'banner-slim' | 'rectangle' = 'banner';
  @Input() label = 'Ad placeholder';
}
