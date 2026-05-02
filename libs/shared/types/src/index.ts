/**
 * @ecom/types — Shared TypeScript types across all MFEs
 */

// ─── Product Types ────────────────────────────────────────────
export interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  originalPrice: number
  image: string
  description: string
  rating: number
  reviewCount: number
  stock: number
  tags: string[]
  badge: string | null
  colors: string[]
}

export interface ProductFilters {
  category?: string
  search?: string
  maxPrice?: number
  sortBy?: 'default' | 'price-asc' | 'price-desc' | 'rating'
}

// ─── Cart Types ───────────────────────────────────────────────
export interface CartItem {
  id: string
  name: string
  brand: string
  price: number
  image: string
  quantity: number
}

// ─── Checkout Types ───────────────────────────────────────────
export type CheckoutStep = 'shipping' | 'payment' | 'review'

export interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  country: string
}

export interface PaymentInfo {
  cardNumber: string
  expiry: string
  cvv: string
  nameOnCard: string
}
