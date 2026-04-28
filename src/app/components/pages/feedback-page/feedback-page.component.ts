import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProsePageComponent } from '../prose-page/prose-page.component';

@Component({
  selector: 'app-feedback-page',
  templateUrl: './feedback-page.component.html',
  imports: [ProsePageComponent, RouterLink],
})
export class FeedbackPageComponent {}
