import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutService } from '../../services/checkout.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-cart-review',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-content">
      <h2 class="step-title">Review Your Order</h2>

      <div class="items-list" *ngIf="(state$ | async) as state">
        <div class="review-item" *ngFor="let item of state.items">
          <img [src]="item.image" [alt]="item.name" class="review-item-image" />
          <div class="review-item-info">
            <span class="review-item-brand">{{ item.brand }}</span>
            <p class="review-item-name">{{ item.name }}</p>
            <span class="review-item-qty">Qty: {{ item.quantity }}</span>
          </div>
          <span class="review-item-price">{{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>

      <div class="summary-box" *ngIf="summary$ | async as summary">
        <div class="summary-line">
          <span>Subtotal</span>
          <span>{{ summary.subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-line">
          <span>Shipping</span>
          <span [class.free]="summary.shipping === 0">
            {{ summary.shipping === 0 ? 'FREE' : '$' + summary.shipping.toFixed(2) }}
          </span>
        </div>
        <div class="summary-line">
          <span>Tax (8%)</span>
          <span>{{ summary.tax.toFixed(2) }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-line summary-total">
          <span>Total</span>
          <span>{{ summary.total.toFixed(2) }}</span>
        </div>
      </div>

      <button id="next-address" class="next-btn" (click)="goToAddress()">
        Continue to Address
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .step-content {
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .step-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .review-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 0;
      border-bottom: 1px solid #d5d9d9;
      transition: all 0.2s;
    }

    .review-item:last-child {
      border-bottom: none;
    }

    .review-item-image {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }

    .review-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .review-item-brand {
      font-size: 11px;
      color: var(--color-primary-light);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .review-item-name {
      font-size: 14px;
      font-weight: 600;
    }

    .review-item-qty {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .review-item-price {
      font-size: 16px;
      font-weight: 700;
      white-space: nowrap;
    }

    .summary-box {
      background: transparent;
      border-top: 1px solid #d5d9d9;
      border-bottom: 1px solid #d5d9d9;
      padding: 20px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 24px 0;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    .summary-total {
      font-size: 18px;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .summary-divider {
      height: 1px;
      background: var(--color-surface-border);
      margin: 4px 0;
    }

    .free {
      color: var(--color-success);
      font-weight: 600;
    }

    .next-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 15px 24px;
      background: var(--gradient-primary);
      border: none;
      border-radius: var(--radius-md);
      color: white;
      font-size: 15px;
      font-weight: 700;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 4px 20px rgba(108, 99, 255, 0.4);
    }

    .next-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(108, 99, 255, 0.6);
    }

    .next-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none !important;
    }
  `],
})
export class CartReviewComponent implements OnInit {
  state$ = this.checkoutService.state$;
  summary$: Observable<any>;

  constructor(private checkoutService: CheckoutService) {
    this.summary$ = this.state$.pipe(
      map((state) => {
        const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const shipping = subtotal > 150 ? 0 : 9.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;
        return { subtotal, shipping, tax, total };
      })
    );
  }

  ngOnInit(): void {}

  goToAddress(): void {
    this.checkoutService.setStep('address');
  }
}
