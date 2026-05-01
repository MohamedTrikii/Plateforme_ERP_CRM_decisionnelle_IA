import { Component, OnInit } from '@angular/core';
import { WebsiteContentService, WebsiteContent, ServiceItem } from '../../../core/services/website-content.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-services',
  template: `
    <section class="page-banner">
      <h1>{{ content?.['website.services.title'] || 'Our Services' }}</h1>
      <p>{{ content?.['website.services.subtitle'] || '' }}</p>
    </section>

    <section class="services-section">
      <div class="services-container">
        <div class="services-grid">
          <div class="service-card" *ngFor="let s of services; let i = index"
               [style.animation-delay]="(i * 80) + 'ms'">
            <div class="service-icon-wrap">
              <mat-icon>{{ s.icon }}</mat-icon>
            </div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Process section -->
    <section class="process-section">
      <div class="section-container">
        <h2>How It Works</h2>
        <div class="process-steps">
          <div class="step" *ngFor="let step of steps; let i = index">
            <div class="step-number">{{ i + 1 }}</div>
            <h4>{{ step.title }}</h4>
            <p>{{ step.body }}</p>
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
      p  { font-size: 16px; opacity: .85; max-width: 600px; margin: 0 auto; }
    }

    .services-section { padding: 80px 24px; background: var(--background-color); }
    .services-container { max-width: 1200px; margin: 0 auto; }
    .services-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px;
    }
    .service-card {
      background: var(--surface-color); border-radius: 16px; padding: 36px 28px;
      box-shadow: var(--shadow-sm); transition: transform .25s, box-shadow .25s;
      animation: fadeUp .5s ease both;
      &:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); }
      h3 { font-size: 18px; font-weight: 700; margin: 16px 0 10px; color: var(--text-primary); }
      p  { font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin: 0; }
    }
    .service-icon-wrap {
      width: 60px; height: 60px; border-radius: 14px; background: #e8eaf6;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 30px; width: 30px; height: 30px; color: var(--primary-color); }
    }

    .process-section { padding: 80px 24px; background: #f0f2ff; }
    .section-container { max-width: 1000px; margin: 0 auto; text-align: center;
      h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 48px; }
    }
    .process-steps {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px;
    }
    .step {
      .step-number {
        width: 56px; height: 56px; border-radius: 50%; background: var(--primary-color);
        color: #fff; font-size: 22px; font-weight: 900; display: flex;
        align-items: center; justify-content: center; margin: 0 auto 16px;
      }
      h4 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
      p  { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0; }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ServicesComponent implements OnInit {
  content: WebsiteContent | null = null;
  services: ServiceItem[] = [];

  steps = [
    { title: 'Sign Up',          body: 'Create your account and configure your tenant in under 2 minutes.' },
    { title: 'Configure',        body: 'Customize branding, enable modules and invite your team.' },
    { title: 'Import Data',      body: 'Bring in your customers, products and historical orders.' },
    { title: 'Grow with AI',     body: 'Let our AI surface insights and predictions as you operate.' },
  ];

  constructor(private readonly websiteService: WebsiteContentService) {}

  ngOnInit(): void {
    this.websiteService.getContent(environment.defaultTenantId).subscribe(c => {
      this.content  = c;
      this.services = this.websiteService.parseJson<ServiceItem[]>(c['website.services.items'], []);
    });
  }
}
