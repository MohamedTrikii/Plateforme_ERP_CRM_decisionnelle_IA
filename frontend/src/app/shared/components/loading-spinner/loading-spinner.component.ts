import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-container" [style.minHeight]="minHeight">
      <mat-progress-spinner mode="indeterminate" [diameter]="diameter" color="primary" />
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 16px;
    }
    .spinner-message { color: var(--text-secondary); font-size: 14px; }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter  = 48;
  @Input() message   = '';
  @Input() minHeight = '200px';
}
