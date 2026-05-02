import { onMounted, onUnmounted } from 'vue'
import { useCartStore } from '../stores/cartStore'
import { on, emit } from '@ecom/event-bus'

export function useCartEvents() {
  const cartStore = useCartStore()
  let unsubs: Array<() => void> = []

  onMounted(() => {
    unsubs.push(
      on('ecom:cart:add', ({ product }) => {
        cartStore.addItem({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image,
          category: (product as any).category || 'Unknown',
        })
      })
    )

    // Announce current cart count on mount
    emit('ecom:cart:updated', { count: cartStore.totalItems })
  })

  onUnmounted(() => {
    unsubs.forEach(unsub => unsub())
  })

  return { cartStore }
}
