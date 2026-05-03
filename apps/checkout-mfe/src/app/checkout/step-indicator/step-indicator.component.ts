import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutStep } from '../../services/checkout.service';

const STEPS: Array<{ id: CheckoutStep; label: string; icon: string }> = [
  { id: 'cart-review', label: 'Review', icon: 'shopping-bag' },
  { id: 'address', label: 'Address', icon: 'map-pin' },
  { id: 'payment', label: 'Payment', icon: 'credit-card' },
  { id: 'confirmation', label: 'Done', icon: 'check-circle-2' },
];

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-indicator" role="progressbar" [attr.aria-valuenow]="currentIdx + 1" [attr.aria-valuemax]="4">
      <ng-container *ngFor="let step of steps; let i = index; let last = last">
        <div
          class="step"
          [class.step-done]="i < currentIdx"
          [class.step-active]="i === currentIdx"
        >
          <div class="step-circle">
            <ng-container *ngIf="i < currentIdx">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </ng-container>
            <ng-container *ngIf="i >= currentIdx">
              <svg *ngIf="step.icon === 'shopping-bag'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <svg *ngIf="step.icon === 'map-pin'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <svg *ngIf="step.icon === 'credit-card'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <svg *ngIf="step.icon === 'check-circle-2'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M7 12.5L10 15l7-7"></path>
              </svg>
            </ng-container>
          </div>
          <span class="step-label">{{ step.label }}</span>
          <div *ngIf="i < steps.length - 1" class="step-line" [class.step-line-done]="i < currentIdx"></div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .step-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
      position: relative;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
      flex: 1;
    }

    .step-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-surface-elevated);
      border: 2px solid var(--color-surface-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      font-size: 14px;
      transition: all 0.3s ease;
      z-index: 1;
      stroke: currentColor;
    }

    .step-active .step-circle {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
      box-shadow: 0 0 20px rgba(108, 99, 255, 0.5);
    }

    .step-done .step-circle {
      background: var(--color-success);
      border-color: var(--color-success);
      color: white;
    }

    .step-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--color-text-muted);
      transition: color 0.3s;
    }

    .step-active .step-label,
    .step-done .step-label {
      color: var(--color-text-primary);
    }

    .step-line {
      position: absolute;
      top: 18px;
      left: 60%;
      right: -40%;
      height: 2px;
      background: var(--color-surface-border);
      z-index: 0;
      transition: background 0.3s;
    }

    .step-line-done {
      background: var(--color-success);
    }
  `],
})
export class StepIndicatorComponent {
  @Input() currentStep: CheckoutStep = 'cart-review';

  steps = STEPS;
  get currentIdx(): number {
    return STEPS.findIndex((s) => s.id === this.currentStep);
  }
}
