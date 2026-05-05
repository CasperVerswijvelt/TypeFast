import { Type } from '@angular/core';
import { Routes } from '@angular/router';
import { TITLE_SUFFIX } from './constants';
import { FAQS } from './components/pages/home-page/home-page.faqs';

interface RouteSeo {
  description: string;
  canonical: string;
  faq?: typeof FAQS;
}

function pageRoute(
  path: string,
  loader: () => Promise<Type<unknown>>,
  pageTitle: string,
  seo: RouteSeo,
): Routes[number] {
  return {
    path,
    loadComponent: loader,
    title: `${pageTitle}${TITLE_SUFFIX}`,
    data: { seo },
  };
}

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
  pageRoute(
    'test',
    () =>
      import('./components/pages/test-page/test-page.component').then(
        (m) => m.TestPageComponent,
      ),
    'Typing test',
    {
      description:
        'Free, minimalistic typing speed test. Measure your WPM and accuracy across 18+ languages, with sentence and word modes, custom themes, and no signup required.',
      canonical: '/test',
    },
  ),
  pageRoute(
    'about',
    () =>
      import('./components/pages/about-page/about-page.component').then(
        (m) => m.AboutPageComponent,
      ),
    'About',
    {
      description:
        'About TypeFast.io — a free, open, ad-supported typing-speed test focused on minimalism, multilanguage word lists, and customisation.',
      canonical: '/about',
    },
  ),
  pageRoute(
    'how-it-works',
    () =>
      import('./components/pages/how-it-works-page/how-it-works-page.component').then(
        (m) => m.HowItWorksPageComponent,
      ),
    'How it works',
    {
      description:
        'How TypeFast.io measures your typing speed: WPM calculation, accuracy scoring, word-mode vs sentence-mode, and supported languages.',
      canonical: '/how-it-works',
    },
  ),
  pageRoute(
    'tips',
    () =>
      import('./components/pages/tips-page/tips-page.component').then(
        (m) => m.TipsPageComponent,
      ),
    'Typing tips',
    {
      description:
        'Practical tips to improve your typing speed and accuracy: posture, finger placement, rhythm, and what to focus on between tests.',
      canonical: '/tips',
    },
  ),
  pageRoute(
    'privacy',
    () =>
      import('./components/pages/privacy-page/privacy-page.component').then(
        (m) => m.PrivacyPageComponent,
      ),
    'Privacy',
    {
      description:
        'Privacy policy for TypeFast.io — what data is collected, how analytics works, and which third parties are involved.',
      canonical: '/privacy',
    },
  ),
  pageRoute(
    'terms',
    () =>
      import('./components/pages/terms-page/terms-page.component').then(
        (m) => m.TermsPageComponent,
      ),
    'Terms of Use',
    {
      description:
        'Terms of use for TypeFast.io — what to expect when using the site, advertising, custom word lists, open-source license, and contact details.',
      canonical: '/terms',
    },
  ),
  pageRoute(
    'changelog',
    () =>
      import('./components/pages/changelog-page/changelog-page.component').then(
        (m) => m.ChangelogPageComponent,
      ),
    'Changelog',
    {
      description:
        'Release history for TypeFast.io — features, fixes, and improvements over time.',
      canonical: '/changelog',
    },
  ),
  pageRoute(
    'contribute',
    () =>
      import('./components/pages/contribute-page/contribute-page.component').then(
        (m) => m.ContributePageComponent,
      ),
    'Contribute',
    {
      description:
        'Help improve TypeFast.io — contribute new languages, report issues, or suggest features on GitHub.',
      canonical: '/contribute',
    },
  ),
  pageRoute(
    'feedback',
    () =>
      import('./components/pages/feedback-page/feedback-page.component').then(
        (m) => m.FeedbackPageComponent,
      ),
    'Feedback',
    {
      description: 'Share feedback, ideas, or bug reports for TypeFast.io.',
      canonical: '/feedback',
    },
  ),
  pageRoute(
    '404',
    () =>
      import('./components/pages/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
    'Page not found',
    {
      description: 'The page you requested could not be found on TypeFast.io.',
      canonical: '/404',
    },
  ),
  pageRoute(
    '**',
    () =>
      import('./components/pages/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
    'Page not found',
    {
      description: 'The page you requested could not be found on TypeFast.io.',
      canonical: '/404',
    },
  ),
];
