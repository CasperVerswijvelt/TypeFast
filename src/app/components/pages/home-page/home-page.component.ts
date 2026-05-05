import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FAQS, FaqEntry } from './home-page.faqs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [RouterLink],
})
export class HomePageComponent {
  readonly faqs: FaqEntry[] = FAQS;
}
