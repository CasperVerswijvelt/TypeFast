import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProsePageComponent } from '../prose-page/prose-page.component';

@Component({
  selector: 'app-how-it-works-page',
  templateUrl: './how-it-works-page.component.html',
  imports: [ProsePageComponent, RouterLink],
})
export class HowItWorksPageComponent {}
