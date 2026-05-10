import { Component, Input } from '@angular/core';

/**
 * PageHeaderComponent – consistent page title + action area across all feature pages.
 */
@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
    }
    .page-title {
      font-size: 24px; font-weight: 700; color: var(--text-primary);
      margin: 0; line-height: 1.3;
    }
    .page-subtitle {
      font-size: 14px; color: var(--text-secondary); margin: 4px 0 0;
    }
    .page-header-actions { display: flex; align-items: center; gap: 8px; }
  `]
})
export class PageHeaderComponent {
  @Input() title    = '';
  @Input() subtitle = '';
}
