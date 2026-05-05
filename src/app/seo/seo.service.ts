import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const ORIGIN = 'https://typefast.io';
const DEFAULT_OG_IMAGE = `${ORIGIN}/og-image.png`;
const DEFAULT_DESCRIPTION =
  'At TypeFast.io you can test your typing speed in a minimalistic way, without skimping out on features such as multilanguage, sentence/word mode, and themes.';
const SITE_NAME = 'TypeFast.io';
const LOGO_URL = `${ORIGIN}/android-chrome-512x512.png`;
const GITHUB_URL = 'https://github.com/CasperVerswijvelt/TypeFast';

const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: `${ORIGIN}/`,
  logo: LOGO_URL,
  sameAs: [GITHUB_URL],
} as const;

const WEB_APPLICATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: `${ORIGIN}/test`,
  description:
    'Free, minimalistic typing speed test that measures WPM and accuracy across 18+ languages, with sentence and word modes and customisable themes.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any (web)',
  browserRequirements: 'Requires JavaScript',
  inLanguage: 'en',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Person',
    name: 'Casper Verswijvelt',
  },
} as const;

export interface SeoData {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  faq?: { question: string; answer: string }[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(data: SeoData): void {
    const description = data.description ?? DEFAULT_DESCRIPTION;
    const ogImage = data.ogImage ?? DEFAULT_OG_IMAGE;
    const path = data.canonical ?? '/';
    const url = `${ORIGIN}${path}`;

    this.title.setTitle(data.title);

    this.meta.updateTag({ name: 'description', content: description });

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: ogImage });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    this.setCanonical(url);
    this.setStructuredData(this.buildStructuredData(data.title, path, data.faq));
  }

  private buildStructuredData(
    title: string,
    path: string,
    faq?: { question: string; answer: string }[],
  ): Record<string, unknown>[] {
    const items: Record<string, unknown>[] = [
      { ...ORGANIZATION_LD },
      this.buildBreadcrumb(title, path),
    ];
    if (path === '/test') items.push({ ...WEB_APPLICATION_LD });
    if (faq?.length) items.push(this.buildFaqPage(faq));
    return items;
  }

  private buildFaqPage(
    faq: { question: string; answer: string }[],
  ): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    };
  }

  private buildBreadcrumb(
    title: string,
    path: string,
  ): Record<string, unknown> {
    const elements: Record<string, unknown>[] = [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: `${ORIGIN}/`,
      },
    ];
    if (path !== '/') {
      elements.push({
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: `${ORIGIN}${path}`,
      });
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: elements,
    };
  }

  private setStructuredData(items: Record<string, unknown>[]): void {
    const head = this.document.head;
    const existing = head.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"][data-seo]',
    );
    existing.forEach((el) => el.remove());
    for (const item of items) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', '1');
      script.textContent = JSON.stringify(item);
      head.appendChild(script);
    }
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
