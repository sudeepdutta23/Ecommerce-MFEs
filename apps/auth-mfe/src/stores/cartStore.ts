import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { emit } from '@ecom/event-bus'

export interface CartProduct {
  id: string
  name: string
  brand: string
  price: number
  image: string
  category: string
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // ── State ──────────────────────────────────────────────────
  const items = ref<CartItem[]>(loadFromStorage())
  const isOpen = ref(false)

  // ── Getters ────────────────────────────────────────────────
  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  )

  const shipping = computed(() => subtotal.value > 150 ? 0 : 9.99)

  const tax = computed(() => subtotal.value * 0.08)

  const total = computed(() => subtotal.value + shipping.value + tax.value)

  // ── Actions ────────────────────────────────────────────────
  function addItem(product: CartProduct) {
    const existing = items.value.find(i => i.product.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ product, quantity: 1 })
    }
    saveToStorage()
    emitCartUpdated()
  }

  function removeItem(productId: string) {
    items.value = items.value.filter(i => i.product.id !== productId)
    saveToStorage()
    emitCartUpdated()
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) { removeItem(productId); return }
    const item = items.value.find(i => i.product.id === productId)
    if (item) { item.quantity = quantity; saveToStorage(); emitCartUpdated() }
  }

  function clearCart() {
    items.value = []
    saveToStorage()
    emitCartUpdated()
  }

  function toggleDrawer() { isOpen.value = !isOpen.value }
  function openDrawer() { isOpen.value = true }
  function closeDrawer() { isOpen.value = false }

  // ── Persistence ────────────────────────────────────────────
  function saveToStorage() {
    try { localStorage.setItem('ecom:cart', JSON.stringify(items.value)) } catch {}
  }

  function emitCartUpdated() {
    emit('ecom:cart:updated', { count: totalItems.value })
  }

  return {
    items, isOpen,
    totalItems, subtotal, shipping, tax, total,
    addItem, removeItem, updateQuantity, clearCart,
    toggleDrawer, openDrawer, closeDrawer,
  }
})

function loadFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem('ecom:cart')
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}
