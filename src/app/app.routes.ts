import { Routes } from '@angular/router';
import { FAQS } from './components/pages/home-page/home-page.faqs';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/pages/home-page/home-page.component').then(
        (m) => m.HomePageComponent,
      ),
    title: 'TypeFast.io – Free typing speed test online',
    data: {
      seo: {
        description:
          'Free online typing speed test with WPM, CPM and accuracy. 18+ languages, word and sentence modes, custom word lists, light and dark themes — no signup.',
        canonical: '/',
        faq: FAQS,
      },
    },
  },
  {
    path: 'test',
    loadComponent: () =>
      import('./components/pages/test-page/test-page.component').then(
        (m) => m.TestPageComponent,
      ),
    title: 'Typing test - TypeFast.io',
    data: {
      seo: {
        description:
          'Free, minimalistic typing speed test. Measure your WPM and accuracy across 18+ languages, with sentence and word modes, custom themes, and no signup required.',
        canonical: '/test',
      },
    },
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./components/pages/about-page/about-page.component').then(
        (m) => m.AboutPageComponent,
      ),
    title: 'About - TypeFast.io',
    data: {
      seo: {
        description:
          'About TypeFast.io — a free, open, ad-supported typing-speed test focused on minimalism, multilanguage word lists, and customisation.',
        canonical: '/about',
      },
    },
  },
  {
    path: 'how-it-works',
    loadComponent: () =>
      import('./components/pages/how-it-works-page/how-it-works-page.component').then(
        (m) => m.HowItWorksPageComponent,
      ),
    title: 'How it works - TypeFast.io',
    data: {
      seo: {
        description:
          'How TypeFast.io measures your typing speed: WPM calculation, accuracy scoring, word-mode vs sentence-mode, and supported languages.',
        canonical: '/how-it-works',
      },
    },
  },
  {
    path: 'tips',
    loadComponent: () =>
      import('./components/pages/tips-page/tips-page.component').then(
        (m) => m.TipsPageComponent,
      ),
    title: 'Typing tips - TypeFast.io',
    data: {
      seo: {
        description:
          'Practical tips to improve your typing speed and accuracy: posture, finger placement, rhythm, and what to focus on between tests.',
        canonical: '/tips',
      },
    },
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./components/pages/privacy-page/privacy-page.component').then(
        (m) => m.PrivacyPageComponent,
      ),
    title: 'Privacy - TypeFast.io',
    data: {
      seo: {
        description:
          'Privacy policy for TypeFast.io — what data is collected, how analytics works, and which third parties are involved.',
        canonical: '/privacy',
      },
    },
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./components/pages/terms-page/terms-page.component').then(
        (m) => m.TermsPageComponent,
      ),
    title: 'Terms of Use - TypeFast.io',
    data: {
      seo: {
        description:
          'Terms of use for TypeFast.io — what to expect when using the site, advertising, custom word lists, open-source license, and contact details.',
        canonical: '/terms',
      },
    },
  },
  {
    path: 'changelog',
    loadComponent: () =>
      import('./components/pages/changelog-page/changelog-page.component').then(
        (m) => m.ChangelogPageComponent,
      ),
    title: 'Changelog - TypeFast.io',
    data: {
      seo: {
        description:
          'Release history for TypeFast.io — features, fixes, and improvements over time.',
        canonical: '/changelog',
      },
    },
  },
  {
    path: 'contribute',
    loadComponent: () =>
      import('./components/pages/contribute-page/contribute-page.component').then(
        (m) => m.ContributePageComponent,
      ),
    title: 'Contribute - TypeFast.io',
    data: {
      seo: {
        description:
          'Help improve TypeFast.io — contribute new languages, report issues, or suggest features on GitHub.',
        canonical: '/contribute',
      },
    },
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./components/pages/feedback-page/feedback-page.component').then(
        (m) => m.FeedbackPageComponent,
      ),
    title: 'Feedback - TypeFast.io',
    data: {
      seo: {
        description: 'Share feedback, ideas, or bug reports for TypeFast.io.',
        canonical: '/feedback',
      },
    },
  },
  {
    path: '404',
    loadComponent: () =>
      import('./components/pages/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
    title: 'Page not found - TypeFast.io',
    data: {
      seo: {
        description:
          'The page you requested could not be found on TypeFast.io.',
        canonical: '/404',
      },
    },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/pages/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
    title: 'Page not found - TypeFast.io',
    data: {
      seo: {
        description:
          'The page you requested could not be found on TypeFast.io.',
        canonical: '/404',
      },
    },
  },
];
