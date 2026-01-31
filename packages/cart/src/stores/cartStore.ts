import { defineStore } from 'pinia';

interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    isLoading: boolean;
}

// Event bus communication (global)
const eventBus = {
    emit: (event: string, data: any) => {
        window.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
};

export const useCartStore = defineStore('cart', {
    state: (): CartState => ({
        items: [
            // Mock initial cart items
            {
                productId: '1',
                name: 'Premium Wireless Headphones',
                price: 299,
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
                quantity: 1,
            },
            {
                productId: '2',
                name: 'Smart Watch Pro',
                price: 449,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
                quantity: 2,
            },
        ],
        isLoading: false,
    }),

    getters: {
        itemCount: (state): number => {
            return state.items.reduce((total, item) => total + item.quantity, 0);
        },
        subtotal: (state): number => {
            return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
        },
        tax: (state): number => {
            const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
            return subtotal * 0.08; // 8% tax
        },
        shipping: (): number => {
            return 9.99;
        },
        total(): number {
            return this.subtotal + this.tax + this.shipping;
        },
    },

    actions: {
        addItem(item: Omit<CartItem, 'quantity'>) {
            const existingItem = this.items.find((i) => i.productId === item.productId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.items.push({ ...item, quantity: 1 });
            }
            this.notifyCartUpdate();
        },

        removeItem(productId: string) {
            const index = this.items.findIndex((i) => i.productId === productId);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.notifyCartUpdate();
            }
        },

        updateQuantity(productId: string, quantity: number) {
            const item = this.items.find((i) => i.productId === productId);
            if (item) {
                if (quantity <= 0) {
                    this.removeItem(productId);
                } else {
                    item.quantity = quantity;
                    this.notifyCartUpdate();
                }
            }
        },

        clearCart() {
            this.items = [];
            this.notifyCartUpdate();
        },

        notifyCartUpdate() {
            eventBus.emit('cart:updated', { itemCount: this.itemCount });
        },
    },
});
