<script setup lang="ts">
import { useCartStore } from '../stores/cartStore';
import { computed } from 'vue';

const cartStore = useCartStore();
const itemCount = computed(() => cartStore.itemCount);
</script>

<template>
  <a href="/cart" class="cart-widget">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    <span v-if="itemCount > 0" class="cart-badge">{{ itemCount }}</span>
  </a>
</template>

<style scoped>
.cart-widget {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: #a1a1aa;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cart-widget:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.cart-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 9px;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: badgePop 0.3s ease;
}

@keyframes badgePop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
