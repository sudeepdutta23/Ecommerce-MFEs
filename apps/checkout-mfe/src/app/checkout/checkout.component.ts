import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { CheckoutService } from '../services/checkout.service';
import { StepIndicatorComponent } from './step-indicator/step-indicator.component';
import { CartReviewComponent } from './steps/cart-review.component';
import { AddressComponent } from './steps/address.component';
import { PaymentComponent } from './steps/payment.component';
import { ConfirmationComponent } from './steps/confirmation.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    StepIndicatorComponent,
    CartReviewComponent,
    AddressComponent,
    PaymentComponent,
    ConfirmationComponent,
  ],
  template: `
    <div class="checkout-page">
      <main class="main">
        <div class="container">
          <app-step-indicator [currentStep]="(state$ | async)?.step || 'cart-review'"></app-step-indicator>

          <div class="checkout-content" [ngSwitch]="(state$ | async)?.step">
            <app-cart-review *ngSwitchCase="'cart-review'"></app-cart-review>
            <app-address *ngSwitchCase="'address'"></app-address>
            <app-payment *ngSwitchCase="'payment'"></app-payment>
            <app-confirmation *ngSwitchCase="'confirmation'"></app-confirmation>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .checkout-page {
      width: 100%;
      background: transparent;
      display: flex;
      flex-direction: column;
      min-height: 600px;
    }

    .main {
      width: 100%;
      flex: 1;
      background: transparent;
      padding: 40px 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .checkout-content {
      width: 100%;
      background: transparent;
      margin-top: 24px;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
})
export class CheckoutComponent {
  state$ = this.checkoutService.state$;

  constructor(public checkoutService: CheckoutService) {}
}
