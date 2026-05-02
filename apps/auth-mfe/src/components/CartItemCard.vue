<template>
  <article class="cart-item" :aria-label="item.product.name">
    <div class="cart-item__image-wrap">
      <img
        :src="item.product.image"
        :alt="item.product.name"
        class="cart-item__image"
        loading="lazy"
      />
    </div>
    <div class="cart-item__details">
      <div class="cart-item__meta">
        <span class="cart-item__brand">{{ item.product.brand }}</span>
        <span class="cart-item__category">{{ item.product.category }}</span>
      </div>
      <h3 class="cart-item__name">{{ item.product.name }}</h3>
      <p class="cart-item__unit-price">${{ item.product.price.toFixed(2) }} each</p>
    </div>
    <div class="cart-item__controls">
      <div class="qty-stepper">
        <button
          class="qty-btn"
          @click="$emit('update-quantity', item.quantity - 1)"
          :aria-label="`Decrease quantity of ${item.product.name}`"
          :disabled="item.quantity <= 1"
        >−</button>
        <span class="qty-value" aria-live="polite">{{ item.quantity }}</span>
        <button
          class="qty-btn"
          @click="$emit('update-quantity', item.quantity + 1)"
          :aria-label="`Increase quantity of ${item.product.name}`"
        >+</button>
      </div>
      <p class="cart-item__line-total">${{ (item.product.price * item.quantity).toFixed(2) }}</p>
      <button
        class="cart-item__remove"
        @click="$emit('remove')"
        :aria-label="`Remove ${item.product.name} from cart`"
      >
        <Trash2 :size="14" />
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import type { CartItem } from '../stores/cartStore'

defineProps<{ item: CartItem }>()
defineEmits<{
  'update-quantity': [qty: number]
  'remove': []
}>()
</script>
