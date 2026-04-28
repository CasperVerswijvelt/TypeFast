import { Component } from '@angular/core';
import { TyperComponent } from '../../typer/typer.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [TyperComponent],
})
export class HomePageComponent {}
