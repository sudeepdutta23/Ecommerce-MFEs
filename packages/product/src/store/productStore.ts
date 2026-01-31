import { create } from 'zustand';
import { Product } from '@ecommerce/shared';

interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    filters: {
        category: string;
        priceRange: [number, number];
        sortBy: string;
        searchQuery: string;
    };
    isLoading: boolean;
    setProducts: (products: Product[]) => void;
    setSelectedProduct: (product: Product | null) => void;
    setFilters: (filters: Partial<ProductState['filters']>) => void;
    setLoading: (loading: boolean) => void;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    selectedProduct: null,
    filters: {
        category: 'all',
        priceRange: [0, 1000],
        sortBy: 'featured',
        searchQuery: '',
    },
    isLoading: false,
    setProducts: (products) => set({ products }),
    setSelectedProduct: (product) => set({ selectedProduct: product }),
    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),
    setLoading: (loading) => set({ isLoading: loading }),
}));
