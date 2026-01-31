import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="checkout-container">
      <h1 class="checkout-title">Checkout</h1>
      
      <!-- Steps -->
      <div class="checkout-steps">
        <div class="step" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
          <span class="step-number">1</span>
          <span class="step-label">Shipping</span>
        </div>
        <div class="step-line" [class.completed]="currentStep > 1"></div>
        <div class="step" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
          <span class="step-number">2</span>
          <span class="step-label">Payment</span>
        </div>
        <div class="step-line" [class.completed]="currentStep > 2"></div>
        <div class="step" [class.active]="currentStep === 3">
          <span class="step-number">3</span>
          <span class="step-label">Review</span>
        </div>
      </div>

      <div class="checkout-layout">
        <!-- Form Section -->
        <div class="checkout-form">
          @if (currentStep === 1) {
            <div class="form-section">
              <h2>Shipping Information</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" placeholder="John" />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Doe" />
                </div>
                <div class="form-group full-width">
                  <label>Address</label>
                  <input type="text" placeholder="123 Main Street" />
                </div>
                <div class="form-group">
                  <label>City</label>
                  <input type="text" placeholder="New York" />
                </div>
                <div class="form-group">
                  <label>ZIP Code</label>
                  <input type="text" placeholder="10001" />
                </div>
              </div>
              <button class="btn-primary" (click)="nextStep()">Continue to Payment</button>
            </div>
          }

          @if (currentStep === 2) {
            <div class="form-section">
              <h2>Payment Method</h2>
              <div class="payment-methods">
                <label class="payment-option" [class.selected]="paymentMethod === 'card'">
                  <input type="radio" name="payment" value="card" [(ngModel)]="paymentMethod" />
                  <span class="option-icon">💳</span>
                  <span>Credit Card</span>
                </label>
                <label class="payment-option" [class.selected]="paymentMethod === 'paypal'">
                  <input type="radio" name="payment" value="paypal" [(ngModel)]="paymentMethod" />
                  <span class="option-icon">🅿️</span>
                  <span>PayPal</span>
                </label>
              </div>
              
              @if (paymentMethod === 'card') {
                <div class="card-form">
                  <div class="form-group full-width">
                    <label>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div class="form-group">
                    <label>Expiry</label>
                    <input type="text" placeholder="MM/YY" />
                  </div>
                  <div class="form-group">
                    <label>CVC</label>
                    <input type="text" placeholder="123" />
                  </div>
                </div>
              }
              
              <div class="button-group">
                <button class="btn-secondary" (click)="prevStep()">Back</button>
                <button class="btn-primary" (click)="nextStep()">Review Order</button>
              </div>
            </div>
          }

          @if (currentStep === 3) {
            <div class="form-section">
              <h2>Order Review</h2>
              <div class="review-items">
                @for (item of cartItems; track item.id) {
                  <div class="review-item">
                    <div class="item-image">{{ item.image }}</div>
                    <div class="item-details">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-qty">Qty: {{ item.quantity }}</span>
                    </div>
                    <span class="item-price">{{ item.price | currency }}</span>
                  </div>
                }
              </div>
              <div class="button-group">
                <button class="btn-secondary" (click)="prevStep()">Back</button>
                <button class="btn-primary" (click)="placeOrder()">Place Order</button>
              </div>
            </div>
          }
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="summary-items">
            @for (item of cartItems; track item.id) {
              <div class="summary-item">
                <span>{{ item.name }} × {{ item.quantity }}</span>
                <span>{{ item.price * item.quantity | currency }}</span>
              </div>
            }
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ subtotal | currency }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>{{ shipping | currency }}</span>
          </div>
          <div class="summary-row">
            <span>Tax</span>
            <span>{{ tax | currency }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ total | currency }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .checkout-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      color: #fff;
    }

    .checkout-title {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 2rem;
    }

    .checkout-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      opacity: 0.5;
    }

    .step.active {
      opacity: 1;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
    }

    .step.completed {
      opacity: 0.8;
    }

    .step-line {
      width: 40px;
      height: 2px;
      background: rgba(255, 255, 255, 0.1);
    }

    .step-line.completed {
      background: #6366f1;
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
    }

    .form-section {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 2rem;
    }

    .form-section h2 {
      color: #fff;
      margin-bottom: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: span 2;
    }

    .form-group label {
      color: #a1a1aa;
      font-size: 0.9rem;
    }

    .form-group input {
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 1rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: #6366f1;
    }

    .btn-primary {
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      border-radius: 10px;
      color: #fff;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    }

    .btn-secondary {
      padding: 0.875rem 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #fff;
      font-weight: 500;
      cursor: pointer;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .payment-methods {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .payment-option {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .payment-option.selected {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.1);
    }

    .payment-option input {
      display: none;
    }

    .option-icon {
      font-size: 1.5rem;
    }

    .card-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .order-summary {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .order-summary h3 {
      color: #fff;
      margin-bottom: 1rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      color: #a1a1aa;
      font-size: 0.9rem;
      padding: 0.5rem 0;
    }

    .summary-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 1rem 0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #a1a1aa;
    }

    .summary-row.total {
      color: #fff;
      font-weight: 600;
      font-size: 1.2rem;
    }

    .review-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      margin-bottom: 0.75rem;
    }

    .item-image {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      font-size: 1.5rem;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .item-name {
      color: #fff;
    }

    .item-qty {
      color: #71717a;
      font-size: 0.9rem;
    }

    .item-price {
      color: #fff;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .checkout-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutComponent {
    currentStep = 1;
    paymentMethod = 'card';

    cartItems: CartItem[] = [
        { id: 1, name: 'Premium Headphones', price: 299, quantity: 1, image: '🎧' },
        { id: 2, name: 'Smart Watch', price: 449, quantity: 1, image: '⌚' },
        { id: 3, name: 'Wireless Earbuds', price: 159, quantity: 2, image: '🎵' },
    ];

    get subtotal(): number {
        return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    get shipping(): number {
        return this.subtotal > 500 ? 0 : 25;
    }

    get tax(): number {
        return this.subtotal * 0.08;
    }

    get total(): number {
        return this.subtotal + this.shipping + this.tax;
    }

    nextStep(): void {
        if (this.currentStep < 3) {
            this.currentStep++;
        }
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    placeOrder(): void {
        alert('Order placed successfully! Thank you for your purchase.');
        this.currentStep = 1;
    }
}
