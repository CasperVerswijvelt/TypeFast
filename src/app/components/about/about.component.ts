import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  @Output() onAboutClosed = new EventEmitter<void>();

  ngOnInit(): void {
    // Empty
  }

  closeAbout(): void {
    this.onAboutClosed.emit();
  }
}
