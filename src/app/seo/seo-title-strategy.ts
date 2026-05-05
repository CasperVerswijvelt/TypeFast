import { Injectable, inject } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SITE_NAME } from '../constants';
import { SeoData, SeoService } from './seo.service';

@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot) ?? SITE_NAME;
    const routeData = this.findDeepestRouteData(snapshot);
    const seoData = (routeData?.['seo'] as Partial<SeoData> | undefined) ?? {};

    this.seo.apply({
      title,
      description: seoData.description,
      canonical: seoData.canonical,
      ogImage: seoData.ogImage,
      faq: seoData.faq,
    });
  }

  private findDeepestRouteData(
    snapshot: RouterStateSnapshot,
  ): Record<string, unknown> | null {
    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.data ?? null;
  }
}
