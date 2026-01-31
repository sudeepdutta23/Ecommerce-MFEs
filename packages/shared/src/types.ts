// Shared TypeScript Types for E-commerce Microfrontend

// Product Types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    tags: string[];
    stock: number;
    rating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
}

// Cart Types
export interface CartItem {
    productId: string;
    product: Product;
    quantity: number;
    addedAt: string;
}

export interface Cart {
    id: string;
    userId?: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    updatedAt: string;
}

// User Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    addresses: Address[];
    role: 'customer' | 'admin';
    createdAt: string;
}

export interface Address {
    id: string;
    type: 'billing' | 'shipping';
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

// Order Types
export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: PaymentMethod;
    status: OrderStatus;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    total: number;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export interface PaymentMethod {
    type: 'card' | 'paypal' | 'bank_transfer';
    last4?: string;
    brand?: string;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Event Payload Types
export interface AddToCartPayload {
    productId: string;
    quantity: number;
}

export interface CartUpdatedPayload {
    cart: Cart;
    itemCount: number;
}

export interface UserLoginPayload {
    user: User;
    token: string;
}

export interface NavigatePayload {
    path: string;
    params?: Record<string, string>;
}
