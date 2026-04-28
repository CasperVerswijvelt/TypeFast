import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TyperStateService } from '../../services/typer-state.service';

interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  imports: [RouterLink, RouterLinkActive],
  host: {
    '[class.dimmed]': 'state.running()',
  },
})
export class NavComponent {
  state = inject(TyperStateService);

  links: NavLink[] = [
    { path: '/about', label: 'about' },
    { path: '/how-it-works', label: 'how-it-works' },
    { path: '/tips', label: 'tips' },
    { path: '/privacy', label: 'privacy' },
    { path: '/changelog', label: 'changelog' },
    { path: '/contribute', label: 'contribute' },
    { path: '/feedback', label: 'feedback' },
  ];
}
