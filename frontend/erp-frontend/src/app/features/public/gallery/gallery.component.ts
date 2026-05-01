import { Component, OnInit } from '@angular/core';
import { WebsiteContentService, WebsiteContent, GalleryItem } from '../../../core/services/website-content.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-gallery',
  template: `
    <section class="page-banner">
      <h1>{{ content?.['website.gallery.title'] || 'Platform Gallery' }}</h1>
    </section>

    <section class="gallery-section">
      <div class="gallery-container">
        <div class="gallery-grid">
          <div class="gallery-item" *ngFor="let item of galleryItems"
               (click)="openLightbox(item)">
            <img [src]="item.url" [alt]="item.caption" loading="lazy">
            <div class="caption-overlay">
              <span>{{ item.caption }}</span>
            </div>
          </div>
        </div>

        <app-empty-state *ngIf="!galleryItems.length && !loading"
          icon="photo_library"
          title="No Gallery Items"
          message="Gallery screenshots will appear here once configured">
        </app-empty-state>
      </div>
    </section>

    <!-- Lightbox -->
    <div class="lightbox" *ngIf="selectedItem" (click)="closeLightbox()">
      <div class="lightbox-inner" (click)="$event.stopPropagation()">
        <button class="lightbox-close" (click)="closeLightbox()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
        <img [src]="selectedItem.url" [alt]="selectedItem.caption">
        <p class="lightbox-caption">{{ selectedItem.caption }}</p>
      </div>
    </div>
  `,
  styles: [`
    .page-banner {
      background: linear-gradient(135deg, #1a1a2e 0%, var(--primary-color) 100%);
      color: #fff; padding: 80px 24px; text-align: center;
      h1 { font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 800; }
    }
    .gallery-section { padding: 80px 24px; background: var(--background-color); }
    .gallery-container { max-width: 1200px; margin: 0 auto; }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .gallery-item {
      position: relative; border-radius: 14px; overflow: hidden;
      cursor: pointer; aspect-ratio: 16/10;
      box-shadow: var(--shadow-sm);
      transition: transform .25s, box-shadow .25s;
      &:hover {
        transform: scale(1.02); box-shadow: var(--shadow-md);
        .caption-overlay { opacity: 1; }
      }
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
    }
    .caption-overlay {
      position: absolute; inset: 0; background: rgba(26,26,46,.6);
      display: flex; align-items: flex-end; padding: 16px;
      opacity: 0; transition: opacity .25s;
      span { color: #fff; font-size: 14px; font-weight: 600; }
    }

    /* Lightbox */
    .lightbox {
      position: fixed; inset: 0; background: rgba(0,0,0,.85); z-index: 2000;
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .lightbox-inner {
      position: relative; max-width: 900px; width: 100%; background: #000; border-radius: 12px; overflow: hidden;
      img { width: 100%; max-height: 75vh; object-fit: contain; display: block; }
    }
    .lightbox-close {
      position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,.1);
      border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; color: #fff; z-index: 1;
      &:hover { background: rgba(255,255,255,.2); }
    }
    .lightbox-caption {
      padding: 12px 16px; color: rgba(255,255,255,.8); font-size: 14px; margin: 0;
      background: #111; text-align: center;
    }
  `]
})
export class GalleryComponent implements OnInit {
  content: WebsiteContent | null = null;
  galleryItems: GalleryItem[] = [];
  selectedItem: GalleryItem | null = null;
  loading = true;

  constructor(private readonly websiteService: WebsiteContentService) {}

  ngOnInit(): void {
    this.websiteService.getContent(environment.defaultTenantId).subscribe(c => {
      this.content      = c;
      this.galleryItems = this.websiteService.parseJson<GalleryItem[]>(c['website.gallery.items'], []);
      this.loading      = false;
    });
  }

  openLightbox(item: GalleryItem): void  { this.selectedItem = item; }
  closeLightbox(): void                  { this.selectedItem = null; }
}
