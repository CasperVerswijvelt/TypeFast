import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProsePageComponent } from '../prose-page/prose-page.component';

@Component({
  selector: 'app-privacy-page',
  templateUrl: './privacy-page.component.html',
  imports: [ProsePageComponent, RouterLink],
})
export class PrivacyPageComponent {}
