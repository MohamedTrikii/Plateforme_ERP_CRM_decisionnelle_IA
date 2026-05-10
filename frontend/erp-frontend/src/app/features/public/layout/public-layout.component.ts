import { Component, OnInit } from '@angular/core';
import { WebsiteContentService, WebsiteContent, SocialLink } from '../../../core/services/website-content.service';
import { ThemeService } from '../../../core/services/theme.service';
import { environment } from '../../../../environments/environment';

/**
 * PublicLayoutComponent – wraps all public website pages.
 *
 * Responsibilities:
 * - Load dynamic website content from backend on init
 * - Render responsive top-nav with company branding
 * - Render footer with social links and copyright
 * - Pass loaded content to child pages via service
 */
@Component({
  selector: 'app-public-layout',
  template: `
    <!-- ── Top Navigation Bar ─────────────────────────────────────────── -->
    <nav class="public-nav" [class.scrolled]="scrolled">
      <div class="nav-container">

        <!-- Logo -->
        <a class="nav-brand" routerLink="/home">
          <img *ngIf="content?.['company.logoUrl']"
               [src]="content?.['company.logoUrl']"
               alt="Logo" class="nav-logo"
               onerror="this.style.display='none'">
          <span class="brand-name">{{ content?.['company.name'] || 'ERP Platform' }}</span>
        </a>

        <!-- Desktop Links -->
        <ul class="nav-links" [class.open]="mobileMenuOpen">
          <li><a routerLink="/home"     routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/about"    routerLinkActive="active">About</a></li>
          <li><a routerLink="/services" routerLinkActive="active">Services</a></li>
          <li><a routerLink="/gallery"  routerLinkActive="active">Gallery</a></li>
          <li><a routerLink="/contact"  routerLinkActive="active">Contact</a></li>
          <li class="nav-cta"><a routerLink="/auth/login" class="btn-login">Login</a></li>
        </ul>

        <!-- Mobile hamburger -->
        <button class="hamburger" (click)="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>

      </div>
    </nav>

    <!-- ── Page Content ───────────────────────────────────────────────── -->
    <main class="page-content">
      <router-outlet></router-outlet>
    </main>

    <!-- ── Footer ─────────────────────────────────────────────────────── -->
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="footer-name">{{ content?.['company.name'] || 'ERP Platform' }}</span>
          <p class="footer-tagline">{{ content?.['website.footer.tagline'] || 'Built for enterprises.' }}</p>
        </div>

        <div class="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a routerLink="/home">Home</a></li>
            <li><a routerLink="/about">About</a></li>
            <li><a routerLink="/services">Services</a></li>
            <li><a routerLink="/contact">Contact</a></li>
          </ul>
        </div>

        <div class="footer-contact">
          <h4>Contact</h4>
          <p>{{ content?.['website.contact.email'] }}</p>
          <p>{{ content?.['website.contact.phone'] }}</p>
          <div class="social-links">
            <a *ngFor="let s of socialLinks"
               [href]="s.url" target="_blank" rel="noopener"
               class="social-icon" [attr.aria-label]="s.platform">
              <mat-icon>{{ getSocialIcon(s.platform) }}</mat-icon>
            </a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>{{ content?.['website.footer.copyright'] || '© 2026 ERP Platform' }}</span>
      </div>
    </footer>
  `,
  styles: [`
    /* ── Nav ─────────────────────────────────────────────────────────── */
    .public-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      background: rgba(255,255,255,.95); backdrop-filter: blur(12px);
      border-bottom: 1px solid transparent;
      transition: border-color .3s, box-shadow .3s;
    }
    .public-nav.scrolled {
      border-bottom-color: #e0e0e0;
      box-shadow: 0 2px 12px rgba(0,0,0,.08);
    }
    .nav-container {
      max-width: 1200px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; height: 68px;
    }
    .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .nav-logo  { height: 36px; width: 36px; object-fit: contain; }
    .brand-name { font-weight: 800; font-size: 20px; color: var(--primary-color); letter-spacing: -.5px; }

    .nav-links {
      display: flex; align-items: center; gap: 4px; list-style: none; margin: 0; padding: 0;
      li a {
        display: block; padding: 8px 14px; border-radius: 6px;
        font-size: 14px; font-weight: 500; color: #444; text-decoration: none;
        transition: background .2s, color .2s;
        &:hover, &.active { background: #e8eaf6; color: var(--primary-color); }
      }
    }
    .btn-login {
      background: var(--primary-color) !important; color: #fff !important;
      border-radius: 8px !important; padding: 8px 20px !important; font-weight: 600 !important;
      &:hover { opacity: .9; }
    }
    .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px;
      span { display: block; width: 24px; height: 2px; background: #333; border-radius: 2px; }
    }

    /* ── Page Content ─────────────────────────────────────────────────── */
    .page-content { padding-top: 68px; min-height: calc(100vh - 68px); }

    /* ── Footer ──────────────────────────────────────────────────────── */
    .site-footer { background: #1a1a2e; color: #ccc; padding: 56px 24px 0; }
    .footer-container {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px;
    }
    .footer-name   { font-size: 22px; font-weight: 800; color: #fff; }
    .footer-tagline{ margin-top: 8px; font-size: 14px; color: #aaa; }
    .footer-links h4, .footer-contact h4 { color: #fff; font-size: 15px; margin-bottom: 16px; }
    .footer-links ul { list-style: none; padding: 0; margin: 0;
      li a { color: #aaa; text-decoration: none; font-size: 14px; line-height: 2;
        &:hover { color: #fff; } } }
    .footer-contact p { font-size: 14px; margin: 4px 0; color: #aaa; }
    .social-links { display: flex; gap: 12px; margin-top: 16px; }
    .social-icon { color: #aaa; display: flex; align-items: center;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &:hover { color: var(--primary-color); }
    }
    .footer-bottom {
      max-width: 1200px; margin: 40px auto 0;
      border-top: 1px solid rgba(255,255,255,.1); padding: 20px 0;
      font-size: 13px; color: #888; text-align: center;
    }

    /* ── Mobile ──────────────────────────────────────────────────────── */
    @media (max-width: 768px) {
      .hamburger { display: flex; }
      .nav-links {
        display: none; position: fixed; top: 68px; left: 0; right: 0;
        background: #fff; flex-direction: column; align-items: stretch;
        padding: 12px; border-bottom: 1px solid #e0e0e0;
        box-shadow: 0 4px 12px rgba(0,0,0,.1);
        &.open { display: flex; }
        li a { padding: 12px 16px; }
      }
      .footer-container { grid-template-columns: 1fr; }
    }
  `]
})
export class PublicLayoutComponent implements OnInit {
  content: WebsiteContent | null = null;
  socialLinks: SocialLink[] = [];
  scrolled = false;
  mobileMenuOpen = false;

  constructor(
    private readonly websiteService: WebsiteContentService,
    private readonly themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    // Load content and apply branding
    this.websiteService.getContent(environment.defaultTenantId).subscribe(c => {
      this.content = c;
      this.themeService.applyConfig(c);
      this.socialLinks = this.websiteService.parseJson<SocialLink[]>(
        c['website.footer.socialLinks'], []
      );
    });

    // Scroll listener for nav shadow
    window.addEventListener('scroll', () => {
      this.scrolled = window.scrollY > 30;
    });
  }

  getSocialIcon(platform: string): string {
    const map: Record<string, string> = {
      linkedin: 'linkedin',
      twitter: 'alternate_email',
      github: 'code',
      facebook: 'facebook',
      instagram: 'photo_camera',
    };
    return map[platform.toLowerCase()] ?? 'link';
  }
}
