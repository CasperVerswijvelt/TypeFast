import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/pages/home-page/home-page.component').then(
        (m) => m.HomePageComponent,
      ),
    title: 'TypeFast.io - Test your typing speed',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./components/pages/about-page/about-page.component').then(
        (m) => m.AboutPageComponent,
      ),
    title: 'About - TypeFast.io',
  },
  {
    path: 'how-it-works',
    loadComponent: () =>
      import('./components/pages/how-it-works-page/how-it-works-page.component').then(
        (m) => m.HowItWorksPageComponent,
      ),
    title: 'How it works - TypeFast.io',
  },
  {
    path: 'tips',
    loadComponent: () =>
      import('./components/pages/tips-page/tips-page.component').then(
        (m) => m.TipsPageComponent,
      ),
    title: 'Typing tips - TypeFast.io',
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./components/pages/privacy-page/privacy-page.component').then(
        (m) => m.PrivacyPageComponent,
      ),
    title: 'Privacy - TypeFast.io',
  },
  {
    path: 'changelog',
    loadComponent: () =>
      import('./components/pages/changelog-page/changelog-page.component').then(
        (m) => m.ChangelogPageComponent,
      ),
    title: 'Changelog - TypeFast.io',
  },
  {
    path: 'contribute',
    loadComponent: () =>
      import('./components/pages/contribute-page/contribute-page.component').then(
        (m) => m.ContributePageComponent,
      ),
    title: 'Contribute - TypeFast.io',
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./components/pages/feedback-page/feedback-page.component').then(
        (m) => m.FeedbackPageComponent,
      ),
    title: 'Feedback - TypeFast.io',
  },
  { path: '**', redirectTo: '' },
];
