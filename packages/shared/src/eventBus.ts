// Event Bus for cross-microfrontend communication
export type EventCallback<T = unknown> = (data: T) => void;

class EventBus {
    private events: Map<string, Set<EventCallback>> = new Map();

    on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)!.add(callback as EventCallback);

        // Return unsubscribe function
        return () => {
            this.events.get(event)?.delete(callback as EventCallback);
        };
    }

    emit<T = unknown>(event: string, data?: T): void {
        this.events.get(event)?.forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event handler for "${event}":`, error);
            }
        });
    }

    off(event: string, callback?: EventCallback): void {
        if (callback) {
            this.events.get(event)?.delete(callback);
        } else {
            this.events.delete(event);
        }
    }

    clear(): void {
        this.events.clear();
    }
}

// Singleton instance
export const eventBus = new EventBus();

// Event Types
export const EVENTS = {
    // Cart Events
    ADD_TO_CART: 'cart:add',
    REMOVE_FROM_CART: 'cart:remove',
    UPDATE_CART: 'cart:update',
    CART_UPDATED: 'cart:updated',
    CLEAR_CART: 'cart:clear',

    // User Events
    USER_LOGIN: 'user:login',
    USER_LOGOUT: 'user:logout',
    USER_UPDATED: 'user:updated',

    // Product Events
    PRODUCT_SELECTED: 'product:selected',
    PRODUCT_VIEWED: 'product:viewed',

    // Order Events
    ORDER_CREATED: 'order:created',
    ORDER_UPDATED: 'order:updated',
    CHECKOUT_STARTED: 'checkout:started',
    CHECKOUT_COMPLETED: 'checkout:completed',

    // Navigation Events
    NAVIGATE: 'navigation:navigate',
} as const;

export default eventBus;
