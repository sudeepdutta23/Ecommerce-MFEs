import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-content">
      <h2 class="step-title">Payment Method</h2>

      <div class="payment-methods">
        <label
          *ngFor="let method of methods"
          [ngClass]="['payment-option', { 'payment-option-active': paymentMethod === method.value }]"
        >
          <input
            type="radio"
            name="payment"
            [value]="method.value"
            [(ngModel)]="paymentMethod"
            (change)="setPayment(method.value)"
            style="display: none"
          />
          <span class="payment-icon">{{ method.icon }}</span>
          <span>{{ method.label }}</span>
          <svg
            *ngIf="paymentMethod === method.value"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="payment-check"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="16 12 12 8 8 12"></polyline>
          </svg>
        </label>
      </div>

      <div class="card-form" *ngIf="paymentMethod === 'card'">
        <div class="form-group">
          <label class="form-label">Card Number</label>
          <input
            type="text"
            class="form-input"
            placeholder="1234 5678 9012 3456"
            [(ngModel)]="cardNumber"
          />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
          <div class="form-group">
            <label class="form-label">Expires</label>
            <input type="text" class="form-input" placeholder="MM/YY" [(ngModel)]="cardExpiry" />
          </div>
          <div class="form-group">
            <label class="form-label">CVV</label>
            <input type="text" class="form-input" placeholder="123" [(ngModel)]="cardCvv" />
          </div>
        </div>
      </div>

      <div class="secure-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <span>Your payment is secure and encrypted</span>
      </div>

      <div class="btn-row">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <button
          id="place-order"
          class="next-btn place-order-btn"
          [disabled]="placing"
          (click)="handlePlaceOrder()"
        >
          <span *ngIf="!placing">Place Order</span>
          <span *ngIf="placing" class="btn-spinner">
            <svg
              class="spinner"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          </span>
        </button>
      </div>
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

    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .payment-option {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: var(--color-surface-card);
      border: 2px solid var(--color-surface-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: 14px;
      font-weight: 500;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .payment-option:hover {
      border-color: rgba(108, 99, 255, 0.4);
      background: rgba(108, 99, 255, 0.05);
    }

    .payment-option-active {
      border-color: var(--color-primary) !important;
      background: rgba(108, 99, 255, 0.1) !important;
    }

    .payment-icon {
      font-size: 20px;
    }

    .payment-check {
      margin-left: auto;
      color: var(--color-primary);
    }

    .card-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .form-input {
      padding: 12px 16px;
      background: var(--color-surface-card);
      border: 1px solid var(--color-surface-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: 14px;
      font-family: var(--font-sans);
      outline: none;
      transition: all 0.15s;
    }

    .form-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.15);
    }

    .secure-note {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--color-text-muted);
      padding: 12px 16px;
      background: rgba(0, 212, 170, 0.06);
      border: 1px solid rgba(0, 212, 170, 0.15);
      border-radius: var(--radius-md);
    }

    .btn-row {
      display: flex;
      gap: 12px;
    }

    .back-btn {
      padding: 14px 20px;
      background: var(--color-glass-hover);
      border: 1px solid var(--color-surface-border);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      font-size: 14px;
      font-weight: 500;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--color-text-primary);
    }

    .next-btn {
      flex: 1;
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

    .next-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(108, 99, 255, 0.6);
    }

    .next-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none !important;
    }

    .place-order-btn {
      background: linear-gradient(135deg, #00d4aa, #6c63ff);
      box-shadow: 0 4px 20px rgba(0, 212, 170, 0.3);
    }

    .place-order-btn:hover:not(:disabled) {
      box-shadow: 0 8px 32px rgba(0, 212, 170, 0.5);
    }

    .btn-spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }
  `],
})
export class PaymentComponent implements OnInit {
  paymentMethod: 'card' | 'paypal' | 'apple' = 'card';
  placing = false;
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';

  methods = [
    { value: 'card' as const, label: 'Credit/Debit Card', icon: '💳' },
    { value: 'paypal' as const, label: 'PayPal', icon: '🅿️' },
    { value: 'apple' as const, label: 'Apple Pay', icon: '🍎' },
  ];

  constructor(private checkoutService: CheckoutService) {}

  ngOnInit(): void {
    this.paymentMethod = this.checkoutService.state.paymentMethod;
  }

  setPayment(method: 'card' | 'paypal' | 'apple'): void {
    this.checkoutService.setPaymentMethod(method);
  }

  handlePlaceOrder(): void {
    this.placing = true;
    setTimeout(() => {
      this.placing = false;
      this.checkoutService.placeOrder();
    }, 1800);
  }

  goBack(): void {
    this.checkoutService.setStep('address');
  }
}
