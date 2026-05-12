import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 48px 24px; text-align: center;
    }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; margin-bottom: 16px; }
    h3 { font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0 0 8px; }
    p  { color: var(--text-secondary); font-size: 14px; margin: 0 0 24px; }
  `]
})
export class EmptyStateComponent {
  @Input() icon    = 'inbox';
  @Input() title   = 'No data found';
  @Input() message = '';
}
