import { RouterLink } from '@angular/router';
import { ProsePageComponent } from './prose-page.component';

// Standard imports for pages whose template wraps content in
// <app-prose-page> and uses [routerLink]. Reduces per-page boilerplate.
export const PROSE_PAGE_IMPORTS = [ProsePageComponent, RouterLink];
