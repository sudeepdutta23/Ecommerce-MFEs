import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { CartItem as CheckoutItem } from '@ecom/types';

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type CheckoutStep = 'cart-review' | 'address' | 'payment' | 'confirmation';

interface CheckoutState {
  step: CheckoutStep;
  items: CheckoutItem[];
  address: Partial<Address>;
  paymentMethod: 'card' | 'paypal' | 'apple';
  orderNumber: string | null;
}

const MOCK_ITEMS: CheckoutItem[] = [
  {
    id: 'p001',
    name: 'AuraSound Pro X1',
    brand: 'SonicLabs',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
    quantity: 1,
  },
  {
    id: 'p005',
    name: 'CloudBook Air 15',
    brand: 'StratusPC',
    price: 999.0,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop',
    quantity: 1,
  },
];

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private initialState: CheckoutState = {
    step: 'cart-review',
    items: MOCK_ITEMS,
    address: {},
    paymentMethod: 'card',
    orderNumber: null,
  };

  private stateSubject = new BehaviorSubject<CheckoutState>(this.initialState);
  public state$: Observable<CheckoutState> = this.stateSubject.asObservable();

  get state(): CheckoutState {
    return this.stateSubject.getValue();
  }

  setStep(step: CheckoutStep): void {
    const current = this.state;
    this.stateSubject.next({ ...current, step });
  }

  setItems(items: CheckoutItem[]): void {
    const current = this.state;
    this.stateSubject.next({ ...current, items });
  }

  updateAddress(data: Partial<Address>): void {
    const current = this.state;
    this.stateSubject.next({
      ...current,
      address: { ...current.address, ...data },
    });
  }

  setPaymentMethod(method: 'card' | 'paypal' | 'apple'): void {
    const current = this.state;
    this.stateSubject.next({ ...current, paymentMethod: method });
  }

  placeOrder(): void {
    const orderNumber = `HM-${Date.now()}`;
    const current = this.state;
    this.stateSubject.next({
      ...current,
      step: 'confirmation',
      orderNumber,
    });
    // Emit custom event for integration with shell
    window.dispatchEvent(
      new CustomEvent('ecom:checkout:complete', { detail: { orderNumber } })
    );
  }

  reset(): void {
    this.stateSubject.next(this.initialState);
  }
}
