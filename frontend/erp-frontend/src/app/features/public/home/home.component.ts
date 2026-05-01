import { Component, OnInit } from '@angular/core';
import { WebsiteContentService, WebsiteContent } from '../../../core/services/website-content.service';
import { environment } from '../../../../environments/environment';

/**
 * HomeComponent – hero section + key value propositions + call-to-action.
 * All text and images are loaded dynamically from SystemConfig.
 */
@Component({
  selector: 'app-home',
  template: `
    <!-- Hero Section -->
    <section class="hero" [style.background-image]="heroBg">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-headline" *ngIf="content">
          {{ content['website.hero.headline'] || 'Powering Enterprise Growth' }}
        </h1>
        <p class="hero-sub" *ngIf="content">
          {{ content['website.hero.subheadline'] || 'A modern AI-driven ERP & CRM platform.' }}
        </p>
        <div class="hero-actions">
          <a [routerLink]="content?.['website.hero.ctaLink'] || '/auth/register'"
             class="btn-primary hero-cta">
            {{ content?.['website.hero.ctaLabel'] || 'Get Started' }}
          </a>
          <a routerLink="/services" class="btn-outline">Learn More</a>
        </div>
      </div>
    </section>

    <!-- Features Strip -->
    <section class="features-strip">
      <div class="strip-inner">
        <div class="feature-item" *ngFor="let f of features">
          <mat-icon>{{ f.icon }}</mat-icon>
          <span>{{ f.label }}</span>
        </div>
      </div>
    </section>

    <!-- Why choose us -->
    <section class="value-section">
      <div class="section-container">
        <h2 class="section-title">Why Choose Us?</h2>
        <div class="value-grid">
          <div class="value-card" *ngFor="let v of values">
            <mat-icon class="value-icon">{{ v.icon }}</mat-icon>
            <h3>{{ v.title }}</h3>
            <p>{{ v.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-banner">
      <div class="cta-inner">
        <h2>Ready to transform your business?</h2>
        <p>Join hundreds of companies already using our platform.</p>
        <a routerLink="/auth/register" class="btn-primary">Start for Free</a>
      </div>
    </section>
  `,
  styles: [`
    /* Hero */
    .hero {
      min-height: 90vh; display: flex; align-items: center;
      background-size: cover; background-position: center;
      position: relative; color: #fff;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(26,26,46,.85) 0%, rgba(63,81,181,.60) 100%);
    }
    .hero-content {
      position: relative; z-index: 1;
      max-width: 700px; margin: 0 auto; padding: 0 24px; text-align: center;
    }
    .hero-headline {
      font-size: clamp(2.2rem, 5vw, 3.6rem); font-weight: 900;
      line-height: 1.15; margin-bottom: 20px;
    }
    .hero-sub {
      font-size: clamp(1rem, 2vw, 1.25rem);
      color: rgba(255,255,255,.85); margin-bottom: 36px; line-height: 1.6;
    }
    .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      background: var(--primary-color); color: #fff; padding: 14px 32px;
      border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none;
      transition: transform .2s, box-shadow .2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(63,81,181,.4); }
    }
    .btn-outline {
      border: 2px solid rgba(255,255,255,.7); color: #fff; padding: 14px 32px;
      border-radius: 10px; font-size: 15px; font-weight: 600; text-decoration: none;
      transition: background .2s;
      &:hover { background: rgba(255,255,255,.15); }
    }

    /* Features strip */
    .features-strip { background: var(--primary-color); padding: 20px 24px; }
    .strip-inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; justify-content: space-around; flex-wrap: wrap; gap: 12px;
    }
    .feature-item {
      display: flex; align-items: center; gap: 8px; color: #fff;
      font-weight: 600; font-size: 14px;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }

    /* Value section */
    .value-section { padding: 80px 24px; background: var(--background-color); }
    .section-container { max-width: 1200px; margin: 0 auto; }
    .section-title {
      text-align: center; font-size: clamp(1.6rem,3vw,2.2rem); font-weight: 800;
      margin-bottom: 48px; color: var(--text-primary);
    }
    .value-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 28px;
    }
    .value-card {
      background: var(--surface-color); border-radius: 14px; padding: 32px;
      box-shadow: var(--shadow-sm); transition: transform .2s, box-shadow .2s;
      &:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
      h3 { font-size: 17px; font-weight: 700; margin: 12px 0 8px; color: var(--text-primary); }
      p  { font-size: 14px; color: var(--text-secondary); line-height: 1.65; margin: 0; }
    }
    .value-icon { font-size: 40px; width: 40px; height: 40px; color: var(--primary-color); }

    /* CTA Banner */
    .cta-banner {
      background: linear-gradient(135deg, #1a1a2e 0%, var(--primary-color) 100%);
      padding: 80px 24px; text-align: center; color: #fff;
    }
    .cta-inner {
      max-width: 600px; margin: 0 auto;
      h2 { font-size: clamp(1.6rem,3vw,2.2rem); font-weight: 800; margin-bottom: 12px; }
      p  { font-size: 15px; opacity: .85; margin-bottom: 28px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  content: WebsiteContent | null = null;
  heroBg = '';

  features = [
    { icon: 'check_circle', label: 'Multi-Tenant SaaS' },
    { icon: 'smart_toy',    label: 'AI-Powered Insights' },
    { icon: 'lock',         label: 'Enterprise Security' },
    { icon: 'speed',        label: 'Real-Time Data' },
    { icon: 'devices',      label: 'Fully Responsive' },
  ];

  values = [
    { icon: 'trending_up',  title: 'Revenue Growth',        body: 'AI-driven predictions help you spot trends before they happen and act proactively.' },
    { icon: 'groups',       title: 'Customer 360°',         body: 'Unified CRM view connecting orders, history and communication in one place.' },
    { icon: 'warehouse',    title: 'Smart Inventory',       body: 'Automated reorder alerts and stock optimization powered by machine learning.' },
    { icon: 'verified',     title: 'Compliance Ready',      body: 'Full audit trail for every action with tamper-proof logs for compliance teams.' },
    { icon: 'tune',         title: 'Zero-Code Config',      body: 'Admins configure branding, modules and content without touching any code.' },
    { icon: 'public',       title: 'Multi-Tenant Isolation',body: 'Each company runs in a fully isolated environment on shared infrastructure.' },
  ];

  constructor(private readonly websiteService: WebsiteContentService) {}

  ngOnInit(): void {
    this.websiteService.getContent(environment.defaultTenantId).subscribe(c => {
      this.content = c;
      const bg = c['website.hero.backgroundUrl'] || 'assets/images/hero-bg.jpg';
      this.heroBg = `url('${bg}')`;
    });
  }
}
