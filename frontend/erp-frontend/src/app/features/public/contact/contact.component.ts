import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WebsiteContentService, WebsiteContent } from '../../../core/services/website-content.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact',
  template: `
    <section class="page-banner">
      <h1>{{ content?.['website.contact.title'] || 'Get in Touch' }}</h1>
    </section>

    <section class="contact-section">
      <div class="contact-container">

        <!-- Info cards -->
        <div class="contact-info">
          <h2>Contact Information</h2>

          <div class="info-card" *ngFor="let info of contactInfo">
            <div class="info-icon"><mat-icon>{{ info.icon }}</mat-icon></div>
            <div>
              <p class="info-label">{{ info.label }}</p>
              <p class="info-value">{{ info.value }}</p>
            </div>
          </div>

          <!-- Map embed -->
          <div class="map-embed" *ngIf="mapUrl">
            <iframe [src]="mapUrl"
                    width="100%" height="250"
                    style="border:0; border-radius:12px;"
                    allowfullscreen loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    title="Location Map">
            </iframe>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="contact-form-wrap">
          <h2>Send Us a Message</h2>
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" novalidate>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="Your full name">
              <mat-error *ngIf="f['name'].errors?.['required']">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" type="email" placeholder="you@example.com">
              <mat-error *ngIf="f['email'].errors?.['required']">Email is required</mat-error>
              <mat-error *ngIf="f['email'].errors?.['email']">Invalid email format</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Subject</mat-label>
              <input matInput formControlName="subject" placeholder="How can we help?">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Message</mat-label>
              <textarea matInput formControlName="message" rows="5" placeholder="Your message..."></textarea>
              <mat-error *ngIf="f['message'].errors?.['required']">Message is required</mat-error>
              <mat-error *ngIf="f['message'].errors?.['minlength']">Message must be at least 10 characters</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="submitting" class="submit-btn">
              <mat-icon *ngIf="!submitting">send</mat-icon>
              <mat-spinner *ngIf="submitting" diameter="20"></mat-spinner>
              {{ submitting ? 'Sending...' : 'Send Message' }}
            </button>

          </form>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .page-banner {
      background: linear-gradient(135deg, #1a1a2e 0%, var(--primary-color) 100%);
      color: #fff; padding: 80px 24px; text-align: center;
      h1 { font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 800; }
    }
    .contact-section { padding: 80px 24px; background: var(--background-color); }
    .contact-container {
      max-width: 1100px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1.4fr; gap: 60px; align-items: start;
      @media(max-width:768px) { grid-template-columns: 1fr; gap: 40px; }
    }
    .contact-info, .contact-form-wrap {
      h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 28px; color: var(--text-primary); }
    }
    .info-card {
      display: flex; gap: 16px; align-items: flex-start;
      background: var(--surface-color); border-radius: 12px;
      padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm);
    }
    .info-icon {
      width: 44px; height: 44px; border-radius: 10px; background: #e8eaf6;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: var(--primary-color); }
    }
    .info-label { font-size: 12px; color: var(--text-secondary); margin: 0 0 4px; text-transform: uppercase; letter-spacing: .5px; }
    .info-value { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
    .map-embed { margin-top: 20px; }

    .full-width { width: 100%; margin-bottom: 8px; }
    .submit-btn {
      width: 100%; padding: 14px; font-size: 15px; font-weight: 700; margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
  `]
})
export class ContactComponent implements OnInit {
  content: WebsiteContent | null = null;
  contactForm: FormGroup;
  submitting = false;
  mapUrl: SafeResourceUrl | null = null;

  contactInfo: Array<{ icon: string; label: string; value: string }> = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly websiteService: WebsiteContentService,
    private readonly notification: NotificationService,
    private readonly sanitizer: DomSanitizer,
  ) {
    this.contactForm = this.fb.group({
      name:    ['', [Validators.required]],
      email:   ['', [Validators.required, Validators.email]],
      subject: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  get f() { return this.contactForm.controls; }

  ngOnInit(): void {
    this.websiteService.getContent(environment.defaultTenantId).subscribe(c => {
      this.content = c;
      this.contactInfo = [
        { icon: 'place',    label: 'Address', value: c['website.contact.address'] || '' },
        { icon: 'phone',    label: 'Phone',   value: c['website.contact.phone']   || '' },
        { icon: 'email',    label: 'Email',   value: c['website.contact.email']   || '' },
      ].filter(i => i.value);

      const embed = c['website.contact.mapEmbedUrl'];
      if (embed) {
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
      }
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    // In a real system this would POST to a backend endpoint.
    // For now, simulate a 1.5s delay and show success.
    setTimeout(() => {
      this.submitting = false;
      this.notification.success('Message sent! We\'ll get back to you shortly.');
      this.contactForm.reset();
    }, 1500);
  }
}
