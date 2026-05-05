import { Component } from '@angular/core';
import { TyperComponent } from '../../typer/typer.component';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.scss'],
  imports: [TyperComponent],
})
export class TestPageComponent {}
