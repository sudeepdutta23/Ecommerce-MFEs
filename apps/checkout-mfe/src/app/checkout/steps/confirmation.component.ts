import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-content">
      <div class="confirmation-header">
        <div class="confirmation-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="M7 12.5L10 15l7-7"></path>
          </svg>
        </div>
        <h2 class="step-title">Order Confirmed!</h2>
        <p class="confirmation-subtitle">
          Your order has been successfully placed. Thank you for shopping with HarborMart.
        </p>
      </div>

      <div class="confirmation-details" *ngIf="state$ | async as state">
        <div class="detail-box">
          <h3 class="detail-title">Order Number</h3>
          <p class="detail-value">{{ state.orderNumber }}</p>
        </div>

        <div class="detail-box">
          <h3 class="detail-title">Shipping Address</h3>
          <p class="detail-text">
            {{ state.address.firstName }} {{ state.address.lastName }}<br />
            {{ state.address.address }}<br />
            {{ state.address.city }}, {{ state.address.state }} {{ state.address.zip }}<br />
            {{ state.address.country }}
          </p>
        </div>

        <div class="detail-box">
          <h3 class="detail-title">Payment Method</h3>
          <p class="detail-text">{{ getPaymentLabel(state.paymentMethod) }}</p>
        </div>

        <div class="detail-box">
          <h3 class="detail-title">Order Items</h3>
          <div class="order-items">
            <div *ngFor="let item of state.items" class="order-item">
              <img [src]="item.image" [alt]="item.name" />
              <div>
                <p>{{ item.name }}</p>
                <span>Qty: {{ item.quantity }}</span>
              </div>
              <span class="item-price">{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="confirmation-actions">
        <button class="btn-primary" (click)="continueShopping()">Continue Shopping</button>
        <button class="btn-secondary" (click)="viewOrder()">View Order Details</button>
      </div>
    </div>
  `,
  styles: [`
    .step-content {
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .confirmation-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
    }

    .confirmation-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(0, 212, 170, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-success);
      animation: popIn 0.6s ease-out;
    }

    .step-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .confirmation-subtitle {
      font-size: 16px;
      color: var(--color-text-secondary);
      max-width: 400px;
    }

    .confirmation-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .detail-box {
      background: var(--color-surface-card);
      border: 1px solid var(--color-surface-border);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
      font-family: monospace;
    }

    .detail-text {
      font-size: 14px;
      color: var(--color-text-primary);
      line-height: 1.6;
    }

    .order-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--color-surface-border);
    }

    .order-item:first-child {
      border-top: none;
      padding-top: 0;
    }

    .order-item img {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }

    .order-item > div {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .order-item p {
      font-size: 13px;
      font-weight: 600;
    }

    .order-item span {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .item-price {
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
    }

    .confirmation-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn-primary,
    .btn-secondary {
      padding: 14px 32px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background: var(--gradient-primary);
      color: white;
      box-shadow: 0 4px 20px rgba(108, 99, 255, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(108, 99, 255, 0.5);
    }

    .btn-secondary {
      background: var(--color-surface-card);
      color: var(--color-text-primary);
      border: 1px solid var(--color-surface-border);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `],
})
export class ConfirmationComponent {
  state$ = this.checkoutService.state$;

  constructor(private checkoutService: CheckoutService) {}

  getPaymentLabel(method: string): string {
    const labels: Record<string, string> = {
      card: 'Credit/Debit Card',
      paypal: 'PayPal',
      apple: 'Apple Pay',
    };
    return labels[method] || method;
  }

  continueShopping(): void {
    this.checkoutService.reset();
    window.location.href = '/';
  }

  viewOrder(): void {
    // Navigate to orders page
    console.log('View order details');
  }
}
