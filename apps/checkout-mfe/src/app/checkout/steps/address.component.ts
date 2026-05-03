import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckoutService, Address } from '../../services/checkout.service';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-content">
      <h2 class="step-title">Shipping Address</h2>

      <div class="form-grid">
        <div *ngFor="let field of fields" class="form-group" [class.form-group-half]="field.half">
          <label [for]="'field-' + field.key" class="form-label">{{ field.label }}</label>
          <input
            [id]="'field-' + field.key"
            class="form-input"
            [class.form-input-error]="errors[field.key]"
            [type]="field.type || 'text'"
            [placeholder]="field.placeholder"
            [(ngModel)]="form[field.key]"
            [attr.name]="field.key"
            (change)="clearError(field.key)"
          />
          <span *ngIf="errors[field.key]" class="field-error">{{ errors[field.key] }}</span>
        </div>
      </div>

      <div class="btn-row">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <button id="next-payment" class="next-btn" (click)="handleSubmit()">
          Continue to Payment
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --color-primary: #232f3e;
      --color-accent: #f08804;
      --color-surface-card: #f7f8f8;
      --color-surface-border: #d5d9d9;
      --color-text-primary: #0f1111;
      --color-text-secondary: #565959;
      --color-text-muted: #6f7373;
      --gradient-primary: linear-gradient(180deg, #ffd814 0%, #f7ca00 100%);
    }

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
      background: linear-gradient(180deg, #ffd814 0%, #f7ca00 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      grid-column: 1 / -1;
    }

    .form-group-half {
      grid-column: auto;
    }

    .form-label {
      font-size: 13px;
      font-weight: 600;
      color: #565959;
      display: block;
      margin-bottom: 4px;
    }

    .form-input {
      padding: 12px 16px;
      background: #f7f8f8;
      border: 1px solid #d5d9d9;
      border-radius: 6px;
      color: #0f1111;
      font-size: 14px;
      font-family: 'Source Sans 3', 'Segoe UI', system-ui, sans-serif;
      outline: none;
      transition: all 0.15s;
    }

    .form-input::placeholder {
      color: #6f7373;
    }

    .form-input:focus {
      border-color: #232f3e;
      box-shadow: 0 0 0 3px rgba(35, 47, 62, 0.15);
    }

    .form-input-error {
      border-color: #f08804 !important;
    }

    .field-error {
      font-size: 12px;
      color: #f08804;
    }

    .btn-row {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }

    .back-btn {
      padding: 14px 20px;
      background: #f3f3f3;
      border: 1px solid #d5d9d9;
      border-radius: 6px;
      color: #565959;
      font-size: 14px;
      font-weight: 500;
      font-family: 'Source Sans 3', 'Segoe UI', system-ui, sans-serif;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: #e8e8e8;
      color: #0f1111;
    }

    .next-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 15px 24px;
      background: linear-gradient(180deg, #ffd814 0%, #f7ca00 100%);
      border: none;
      border-radius: 6px;
      color: #0f1111;
      font-size: 15px;
      font-weight: 700;
      font-family: 'Source Sans 3', 'Segoe UI', system-ui, sans-serif;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 4px 12px rgba(254, 189, 105, 0.4);
    }

    .next-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(254, 189, 105, 0.6);
    }

    .next-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none !important;
    }
  `],
})
export class AddressComponent implements OnInit {
  form: any = {};
  errors: Record<string, string> = {};

  fields = [
    { key: 'firstName', label: 'First Name', placeholder: 'John', half: true },
    { key: 'lastName', label: 'Last Name', placeholder: 'Doe', half: true },
    { key: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email', half: false },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', type: 'tel', half: false },
    { key: 'address', label: 'Street Address', placeholder: '123 Main Street', half: false },
    { key: 'city', label: 'City', placeholder: 'San Francisco', half: true },
    { key: 'state', label: 'State', placeholder: 'CA', half: true },
    { key: 'zip', label: 'ZIP Code', placeholder: '94105', half: true },
    { key: 'country', label: 'Country', placeholder: 'United States', half: true },
  ];

  constructor(private checkoutService: CheckoutService) {}

  ngOnInit(): void {
    this.form = { ...this.checkoutService.state.address };
  }

  clearError(key: string): void {
    this.errors[key] = '';
  }

  validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!this.form.firstName) errs['firstName'] = 'Required';
    if (!this.form.lastName) errs['lastName'] = 'Required';
    if (!this.form.email || !this.form.email.includes('@')) errs['email'] = 'Valid email required';
    if (!this.form.address) errs['address'] = 'Required';
    if (!this.form.city) errs['city'] = 'Required';
    if (!this.form.zip) errs['zip'] = 'Required';
    return errs;
  }

  handleSubmit(): void {
    const errs = this.validate();
    if (Object.keys(errs).length > 0) {
      this.errors = errs;
      return;
    }
    this.checkoutService.updateAddress(this.form);
    this.checkoutService.setStep('payment');
  }

  goBack(): void {
    this.checkoutService.setStep('cart-review');
  }
}
