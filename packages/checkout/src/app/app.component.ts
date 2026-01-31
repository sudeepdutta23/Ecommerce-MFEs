import { Component } from '@angular/core';
import { CheckoutComponent } from './checkout/checkout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CheckoutComponent],
  template: `
    <div class="app-container">
      <app-checkout />
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #0a0a0f;
      background-image: 
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent),
        radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139, 92, 246, 0.1), transparent);
    }
  `]
})
export class AppComponent {
  title = 'checkout';
}
