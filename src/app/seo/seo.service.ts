import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const ORIGIN = 'https://typefast.io';
const DEFAULT_OG_IMAGE = `${ORIGIN}/android-chrome-512x512.png`;
const DEFAULT_DESCRIPTION =
  'At TypeFast.io you can test your typing speed in a minimalistic way, without skimping out on features such as multilanguage, sentence/word mode, and themes.';

export interface SeoData {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(data: SeoData): void {
    const description = data.description ?? DEFAULT_DESCRIPTION;
    const ogImage = data.ogImage ?? DEFAULT_OG_IMAGE;
    const url = data.canonical ? `${ORIGIN}${data.canonical}` : ORIGIN;

    this.title.setTitle(data.title);

    this.meta.updateTag({ name: 'description', content: description });

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'TypeFast.io' });
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: ogImage });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    this.setCanonical(url);
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
