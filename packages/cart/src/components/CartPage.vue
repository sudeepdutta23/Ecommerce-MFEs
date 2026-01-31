<script setup lang="ts">
import { useCartStore } from '../stores/cartStore';
import { computed } from 'vue';

const cartStore = useCartStore();

const items = computed(() => cartStore.items);
const subtotal = computed(() => cartStore.subtotal);
const tax = computed(() => cartStore.tax);
const shipping = computed(() => cartStore.shipping);
const total = computed(() => cartStore.total);
const isEmpty = computed(() => cartStore.items.length === 0);

const updateQuantity = (productId: string, delta: number) => {
  const item = items.value.find((i) => i.productId === productId);
  if (item) {
    cartStore.updateQuantity(productId, item.quantity + delta);
  }
};

const removeItem = (productId: string) => {
  cartStore.removeItem(productId);
};

const formatPrice = (price: number) => {
  return price.toFixed(2);
};
</script>

<template>
  <div class="cart-page">
    <h1 class="cart-title">Shopping Cart</h1>
    
    <!-- Empty Cart State -->
    <div v-if="isEmpty" class="empty-cart">
      <div class="empty-icon">🛒</div>
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added anything to your cart yet.</p>
      <a href="/products" class="continue-shopping-btn">
        Continue Shopping
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>

    <!-- Cart Content -->
    <div v-else class="cart-content">
      <div class="cart-items">
        <div 
          v-for="item in items" 
          :key="item.productId" 
          class="cart-item"
        >
          <div class="item-image-container">
            <img :src="item.image" :alt="item.name" class="item-image" />
          </div>
          
          <div class="item-details">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-price">${{ formatPrice(item.price) }}</p>
          </div>
          
          <div class="quantity-controls">
            <button 
              class="qty-btn"
              @click="updateQuantity(item.productId, -1)"
              :disabled="item.quantity <= 1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button 
              class="qty-btn"
              @click="updateQuantity(item.productId, 1)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
          
          <div class="item-total">
            ${{ formatPrice(item.price * item.quantity) }}
          </div>
          
          <button 
            class="remove-btn"
            @click="removeItem(item.productId)"
            aria-label="Remove item"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <h2 class="summary-title">Order Summary</h2>
        
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${{ formatPrice(subtotal) }}</span>
        </div>
        
        <div class="summary-row">
          <span>Shipping</span>
          <span>${{ formatPrice(shipping) }}</span>
        </div>
        
        <div class="summary-row">
          <span>Tax</span>
          <span>${{ formatPrice(tax) }}</span>
        </div>
        
        <div class="summary-divider"></div>
        
        <div class="summary-row total">
          <span>Total</span>
          <span>${{ formatPrice(total) }}</span>
        </div>

        <a href="/checkout" class="checkout-btn">
          Proceed to Checkout
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>

        <div class="secure-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Secure checkout with SSL encryption</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  padding: 1rem 0;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.cart-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 2rem;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-cart h2 {
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.empty-cart p {
  color: #71717a;
  margin-bottom: 2rem;
}

.continue-shopping-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.continue-shopping-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

/* Cart Content */
.cart-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;
}

/* Cart Items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.cart-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.item-image-container {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.item-price {
  color: #71717a;
  font-size: 0.95rem;
}

/* Quantity Controls */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.5rem;
}

.qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qty-btn:hover:not(:disabled) {
  background: #6366f1;
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-value {
  width: 32px;
  text-align: center;
  font-weight: 600;
  color: #ffffff;
}

.item-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  min-width: 100px;
  text-align: right;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #71717a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Order Summary */
.order-summary {
  position: sticky;
  top: 100px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  color: #a1a1aa;
  font-size: 0.95rem;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.summary-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0.75rem 0;
}

.checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1.1rem;
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  text-decoration: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5);
}

.secure-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  color: #71717a;
  font-size: 0.8rem;
}

@media (max-width: 900px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-item {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .item-total {
    min-width: auto;
  }

  .order-summary {
    position: static;
  }
}
</style>
