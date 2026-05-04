import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TyperStateService } from '../../services/typer-state.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [RouterLink],
  host: {
    '[class.dimmed]': 'state.running()',
  },
})
export class FooterComponent {
  state = inject(TyperStateService);

  readonly year = new Date().getFullYear();
}
