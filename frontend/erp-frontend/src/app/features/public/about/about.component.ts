import { Component, OnInit } from '@angular/core';
import { WebsiteContentService, WebsiteContent } from '../../../core/services/website-content.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-about',
  template: `
    <!-- Page Banner -->
    <section class="page-banner">
      <h1>{{ content?.['website.about.title'] || 'About Us' }}</h1>
      <nav aria-label="breadcrumb" class="breadcrumb">
        <a routerLink="/home">Home</a> / <span>About</span>
      </nav>
    </section>

    <section class="about-main">
      <div class="about-container">

        <!-- Story -->
        <div class="about-grid">
          <div class="about-text">
            <h2>Our Story</h2>
            <p>{{ content?.['website.about.story'] || '' }}</p>
            <div class="mission-box" *ngIf="content?.['website.about.mission']">
              <mat-icon>lightbulb</mat-icon>
              <p><strong>Our Mission:</strong> {{ content?.['website.about.mission'] }}</p>
            </div>
          </div>
          <div class="about-image" *ngIf="content?.['website.about.photoUrl']">
            <img [src]="content?.['website.about.photoUrl']" alt="Team photo" loading="lazy">
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-item" *ngFor="let s of stats">
            <span class="stat-number">{{ s.value }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>

        <!-- Values -->
        <h2 class="values-title">Our Core Values</h2>
        <div class="values-grid">
          <div class="value-card" *ngFor="let v of coreValues">
            <mat-icon>{{ v.icon }}</mat-icon>
            <h3>{{ v.title }}</h3>
            <p>{{ v.body }}</p>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .page-banner {
      background: linear-gradient(135deg, #1a1a2e 0%, var(--primary-color) 100%);
      color: #fff; padding: 80px 24px; text-align: center;
      h1 { font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 800; margin-bottom: 12px; }
    }
    .breadcrumb { font-size: 14px; opacity: .75;
      a { color: #fff; text-decoration: none; &:hover { text-decoration: underline; } }
    }

    .about-main { padding: 80px 24px; background: var(--background-color); }
    .about-container { max-width: 1200px; margin: 0 auto; }
    .about-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
      margin-bottom: 60px;
      @media(max-width:768px) { grid-template-columns: 1fr; }
    }
    .about-text {
      h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 16px; color: var(--text-primary); }
      p  { font-size: 15px; color: var(--text-secondary); line-height: 1.8; }
    }
    .mission-box {
      display: flex; gap: 12px; align-items: flex-start;
      background: #e8eaf6; border-radius: 10px; padding: 20px; margin-top: 24px;
      mat-icon { color: var(--primary-color); margin-top: 2px; flex-shrink: 0; }
      p { margin: 0; color: var(--text-primary); font-size: 14px; }
    }
    .about-image img {
      width: 100%; border-radius: 16px; box-shadow: var(--shadow-lg); object-fit: cover;
    }

    .stats-row {
      display: flex; gap: 0; background: var(--primary-color);
      border-radius: 16px; overflow: hidden; margin-bottom: 60px;
      flex-wrap: wrap;
    }
    .stat-item {
      flex: 1; min-width: 150px; text-align: center; padding: 32px 16px; color: #fff;
      border-right: 1px solid rgba(255,255,255,.2);
      &:last-child { border-right: none; }
      .stat-number { display: block; font-size: 2.5rem; font-weight: 900; }
      .stat-label  { display: block; font-size: 13px; opacity: .8; margin-top: 4px; }
    }

    .values-title { font-size: 1.8rem; font-weight: 800; text-align: center; margin-bottom: 36px; }
    .values-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px;
    }
    .value-card {
      background: var(--surface-color); border-radius: 12px; padding: 28px;
      box-shadow: var(--shadow-sm); text-align: center;
      mat-icon { font-size: 44px; width: 44px; height: 44px; color: var(--primary-color); margin-bottom: 12px; }
      h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
      p  { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0; }
    }
  `]
})
export class AboutComponent implements OnInit {
  content: WebsiteContent | null = null;

  stats = [
    { value: '500+', label: 'Clients Served' },
    { value: '12+',  label: 'Years Experience' },
    { value: '99.9%',label: 'Uptime SLA' },
    { value: '24/7', label: 'Support' },
  ];

  coreValues = [
    { icon: 'verified_user', title: 'Integrity',    body: 'We build trust through transparent communication and ethical practices.' },
    { icon: 'lightbulb',     title: 'Innovation',   body: 'Continuously pushing the boundaries of what enterprise software can be.' },
    { icon: 'groups',        title: 'Customer First',body: 'Every feature decision starts and ends with the customer impact.' },
    { icon: 'eco',           title: 'Sustainability',body: 'Building for the long term — for our users, teams and environment.' },
  ];

  constructor(private readonly websiteService: WebsiteContentService) {}

  ngOnInit(): void {
    this.websiteService.getContent(environment.defaultTenantId).subscribe(c => {
      this.content = c;
    });
  }
}
