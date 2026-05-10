import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

export interface GalleryItem {
  url: string;
  caption: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface WebsiteContent {
  // Hero
  'website.hero.headline':      string;
  'website.hero.subheadline':   string;
  'website.hero.ctaLabel':      string;
  'website.hero.ctaLink':       string;
  'website.hero.backgroundUrl': string;
  // About
  'website.about.title':    string;
  'website.about.story':    string;
  'website.about.mission':  string;
  'website.about.photoUrl': string;
  // Services
  'website.services.title':    string;
  'website.services.subtitle': string;
  'website.services.items':    string; // JSON
  // Gallery
  'website.gallery.title': string;
  'website.gallery.items': string; // JSON
  // Contact
  'website.contact.title':       string;
  'website.contact.address':     string;
  'website.contact.phone':       string;
  'website.contact.email':       string;
  'website.contact.mapEmbedUrl': string;
  // Footer
  'website.footer.copyright':   string;
  'website.footer.tagline':     string;
  'website.footer.socialLinks': string; // JSON
  // Branding
  'company.name':    string;
  'company.logoUrl': string;
  [key: string]: string;
}

/**
 * WebsiteContentService – loads dynamic public website content from the backend.
 * Called once by PublicLayoutComponent on init; result is shared via Observable.
 */
@Injectable({ providedIn: 'root' })
export class WebsiteContentService {

  private readonly BASE_URL = `${environment.coreApiUrl}/website`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Loads all public website content for the given tenant.
   * Falls back to empty object on error so the site still renders.
   */
  getContent(tenantId = 'default'): Observable<WebsiteContent> {
    return this.http
      .get<WebsiteContent>(`${this.BASE_URL}/content`, { params: { tenantId } })
      .pipe(
        catchError(() => of({} as WebsiteContent))
      );
  }

  /** Parse a JSON config value safely, returning the fallback on failure. */
  parseJson<T>(raw: string | undefined, fallback: T): T {
    try {
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }
}
