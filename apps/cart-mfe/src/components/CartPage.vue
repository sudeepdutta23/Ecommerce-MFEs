<template>
  <div class="cart-page">
    <!-- Header -->
    <div class="cart-header">
      <div class="cart-header__left">
        <div class="cart-header__icon-wrap">
          <ShoppingCart :size="22" />
        </div>
        <div>
          <h1 class="cart-header__title">Shopping Cart</h1>
          <p class="cart-header__sub">{{ cartStore.totalItems }} {{ cartStore.totalItems === 1 ? 'item' : 'items' }}</p>
        </div>
      </div>
      <button v-if="cartStore.items.length > 0" class="cart-clear-btn" @click="cartStore.clearCart()" aria-label="Clear cart">
        <Trash2 :size="14" /> Clear All
      </button>
    </div>

    <!-- Free Shipping Banner -->
    <div v-if="cartStore.subtotal > 0 && cartStore.subtotal < 150" class="shipping-banner">
      <Truck :size="16" />
      <span>Add <strong>${{ (150 - cartStore.subtotal).toFixed(2) }}</strong> more for FREE shipping!</span>
      <div class="shipping-banner__bar">
        <div class="shipping-banner__fill" :style="{ width: `${Math.min((cartStore.subtotal / 150) * 100, 100)}%` }" />
      </div>
    </div>
    <div v-else-if="cartStore.subtotal >= 150" class="shipping-banner shipping-banner--free">
      <Truck :size="16" />
      <span>🎉 You've unlocked <strong>FREE shipping!</strong></span>
    </div>

    <!-- Empty State -->
    <div v-if="cartStore.items.length === 0" class="cart-empty" aria-live="polite">
      <div class="cart-empty__icon">🛒</div>
      <h2>Your cart is empty</h2>
      <p>Find deals across top brands and add items to get started.</p>
      <a href="http://localhost:3000" class="cart-empty__link">Browse HarborMart →</a>
    </div>

    <!-- Cart Content -->
    <div v-else class="cart-layout">
      <!-- Items List -->
      <section class="cart-items" aria-label="Cart items">
        <TransitionGroup name="cart-item" tag="div">
          <CartItemCard
            v-for="item in cartStore.items"
            :key="item.product.id"
            :item="item"
            @update-quantity="(qty) => cartStore.updateQuantity(item.product.id, qty)"
            @remove="cartStore.removeItem(item.product.id)"
          />
        </TransitionGroup>
      </section>

      <!-- Order Summary -->
      <aside class="order-summary" aria-label="Order summary">
        <h2 class="order-summary__title">Order Summary</h2>

        <div class="order-summary__lines">
          <div class="order-summary__line">
            <span>Subtotal ({{ cartStore.totalItems }} items)</span>
            <span>${{ cartStore.subtotal.toFixed(2) }}</span>
          </div>
          <div class="order-summary__line">
            <span>Shipping</span>
            <span :class="cartStore.shipping === 0 ? 'free-tag' : ''">
              {{ cartStore.shipping === 0 ? 'FREE' : `$${cartStore.shipping.toFixed(2)}` }}
            </span>
          </div>
          <div class="order-summary__line">
            <span>Tax (8%)</span>
            <span>${{ cartStore.tax.toFixed(2) }}</span>
          </div>
          <div class="order-summary__divider" />
          <div class="order-summary__line order-summary__line--total">
            <span>Total</span>
            <span>${{ cartStore.total.toFixed(2) }}</span>
          </div>
        </div>

        <button id="checkout-btn" class="checkout-btn" @click="onCheckout" aria-label="Proceed to checkout">
          <span>Proceed to Checkout</span>
          <ArrowRight :size="18" />
        </button>

        <div class="order-summary__secure">
          <Shield :size="14" />
          <span>Secure checkout · 256-bit SSL</span>
        </div>

        <!-- Tech Badge -->
        <div class="order-summary__tech-badge">
          <span class="tech-dot" style="background:#42b883" />
          Vue 3 · Pinia Store
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShoppingCart, Trash2, ArrowRight, Shield, Truck } from 'lucide-vue-next'
import { useCartEvents } from '../composables/useCartEvents'
import CartItemCard from './CartItemCard.vue'

const { cartStore } = useCartEvents()

function onCheckout() {
  window.dispatchEvent(new CustomEvent('ecom:checkout:start', {
    detail: {
      items: cartStore.items,
      total: cartStore.total,
    }
  }))
  if (window.location.port !== '3100') {
    window.location.assign('http://localhost:3100/checkout')
  }
}
</script>
