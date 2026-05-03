import { create } from 'zustand'
import { emit } from '@ecom/event-bus'
import type { CartItem as CheckoutItem } from '@ecom/types'



export interface Address {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  country: string
}

export type CheckoutStep = 'cart-review' | 'address' | 'payment' | 'confirmation'

interface CheckoutStore {
  step: CheckoutStep
  items: CheckoutItem[]
  address: Partial<Address>
  paymentMethod: 'card' | 'paypal' | 'apple'
  orderNumber: string | null

  setStep: (step: CheckoutStep) => void
  setItems: (items: CheckoutItem[]) => void
  updateAddress: (data: Partial<Address>) => void
  setPaymentMethod: (method: 'card' | 'paypal' | 'apple') => void
  placeOrder: () => void
  reset: () => void
}

const MOCK_ITEMS: CheckoutItem[] = [
  { id: 'p001', name: 'AuraSound Pro X1', brand: 'SonicLabs', price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', quantity: 1 },
  { id: 'p005', name: 'CloudBook Air 15', brand: 'StratusPC', price: 999.00, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop', quantity: 1 },
]

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  step: 'cart-review',
  items: MOCK_ITEMS,
  address: {},
  paymentMethod: 'card',
  orderNumber: null,

  setStep: (step) => set({ step }),
  setItems: (items) => set({ items }),
  updateAddress: (data) => set((state) => ({ address: { ...state.address, ...data } })),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  placeOrder: () => {
    const orderNumber = `LX-${Date.now().toString(36).toUpperCase()}`
    set({ orderNumber, step: 'confirmation' })
    emit('ecom:checkout:complete', { orderNumber })
  },
  reset: () => set({ step: 'cart-review', items: MOCK_ITEMS, address: {}, orderNumber: null }),
}))
