import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { AdPlaceholderComponent } from '../ad-placeholder/ad-placeholder.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  imports: [MarkdownComponent, AdPlaceholderComponent],
})
export class AboutComponent implements OnInit {
  @Output() aboutClosed = new EventEmitter<void>();

  ngOnInit(): void {
    // Empty
  }

  closeAbout(): void {
    this.aboutClosed.emit();
  }
}
