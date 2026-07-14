import { makeAutoObservable, runInAction } from 'mobx';
import { type Product } from '@ecom/types';
import { addCartItem, eventBus, getCartCount } from '@ecom/utils';
import { DEMO_PRODUCTS } from './demo-products';

const PAGE_SIZE = 12;

/**
 * MobX store PRIVATE to the product-catalog MFE.
 *
 * Instantiated per mount and provided via React context (see CatalogProvider).
 * The only outbound signals are event-bus emissions defined by the shared
 * contract — no other MFE can reach into this store.
 */
export class CatalogStore {
  products: Product[] = [];
  query = '';
  category = 'all';
  page = 1;
  status: 'idle' | 'loading' | 'error' = 'idle';
  cartCount = getCartCount();

  constructor() {
    makeAutoObservable(this);
  }

  get categories(): string[] {
    return ['all', ...new Set(this.products.map((product) => product.category))];
  }

  get filteredProducts(): Product[] {
    const query = this.query.trim().toLowerCase();
    return this.products.filter((product) => {
      const matchesCategory = this.category === 'all' || product.category === this.category;
      const matchesQuery =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / PAGE_SIZE));
  }

  /** The current page slice of the filtered list (client-side pagination). */
  get pagedProducts(): Product[] {
    const start = (this.page - 1) * PAGE_SIZE;
    return this.filteredProducts.slice(start, start + PAGE_SIZE);
  }

  /** 1-based index range of the visible slice, for the "Showing x–y of z" line. */
  get pageRange(): { from: number; to: number; total: number } {
    const total = this.filteredProducts.length;
    if (total === 0) return { from: 0, to: 0, total };
    const from = (this.page - 1) * PAGE_SIZE + 1;
    return { from, to: Math.min(from + PAGE_SIZE - 1, total), total };
  }

  productById(id: string): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  setQuery(query: string): void {
    this.query = query;
    this.page = 1;
  }

  setCategory(category: string): void {
    this.category = category;
    this.page = 1;
  }

  setPage(page: number): void {
    this.page = Math.min(Math.max(1, page), this.totalPages);
  }

  /** Demo loader: replace with a real API call via createApiClient. */
  async loadProducts(): Promise<void> {
    this.status = 'loading';
    try {
      const products = await fetchDemoProducts();
      runInAction(() => {
        this.products = products;
        this.status = 'idle';
      });
    } catch {
      runInAction(() => {
        this.status = 'error';
      });
    }
  }

  /** Load once per store instance; lets any page (or deep link) mount without re-fetching. */
  async ensureProductsLoaded(): Promise<void> {
    if (this.products.length === 0 && this.status !== 'loading') {
      await this.loadProducts();
    }
  }

  addToCart(product: Product): void {
    const items = addCartItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      currency: product.currency,
      imageUrl: product.imageUrl,
    });
    this.cartCount = getCartCount(items);
    eventBus.emit('cart:item-added', {
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
    });
    eventBus.emit('cart:changed', { count: this.cartCount });
    eventBus.emit('analytics:track', {
      name: 'add_to_cart',
      source: 'product-catalog',
      payload: { productId: product.id },
    });
  }
}

async function fetchDemoProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return DEMO_PRODUCTS;
}
