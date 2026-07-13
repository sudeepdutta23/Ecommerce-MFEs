import { makeAutoObservable, runInAction } from 'mobx';
import { type Product } from '@ecom/types';
import { eventBus } from '@ecom/utils';

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
  status: 'idle' | 'loading' | 'error' = 'idle';
  cartCount = 0;

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

  setQuery(query: string): void {
    this.query = query;
  }

  setCategory(category: string): void {
    this.category = category;
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

  addToCart(product: Product): void {
    this.cartCount += 1;
    eventBus.emit('cart:item-added', {
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
    });
    eventBus.emit('analytics:track', {
      name: 'add_to_cart',
      source: 'product-catalog',
      payload: { productId: product.id },
    });
  }
}

async function fetchDemoProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [
    {
      id: 'p-1',
      name: 'Galaxy S22 Ultra',
      description: '12GB | 256 GB, Burgundy — 108MP camera with Nightography.',
      price: 65999,
      mrp: 74999,
      currency: 'INR',
      category: 'Smartphones',
      rating: 4.7,
      inStock: true,
    },
    {
      id: 'p-2',
      name: 'Galaxy M13 (4GB | 64 GB)',
      description: '6000mAh battery with 15W fast charging.',
      price: 10499,
      mrp: 14999,
      currency: 'INR',
      category: 'Smartphones',
      rating: 4.3,
      inStock: true,
    },
    {
      id: 'p-3',
      name: 'Galaxy M33 (4GB | 64 GB)',
      description: '5G ready with 120Hz display.',
      price: 16999,
      mrp: 24999,
      currency: 'INR',
      category: 'Smartphones',
      rating: 4.4,
      inStock: true,
    },
    {
      id: 'p-4',
      name: 'Galaxy M53 (4GB | 64 GB)',
      description: '108MP camera and Super AMOLED+ display.',
      price: 31999,
      mrp: 40999,
      currency: 'INR',
      category: 'Smartphones',
      rating: 4.5,
      inStock: true,
    },
    {
      id: 'p-5',
      name: 'Buds Pro Wireless Earbuds',
      description: 'Active noise cancellation with 28-hour playtime.',
      price: 4999,
      mrp: 7999,
      currency: 'INR',
      category: 'Audio',
      rating: 4.5,
      inStock: true,
    },
    {
      id: 'p-6',
      name: 'Watch Active Smartwatch',
      description: 'Fitness tracking, GPS, and a 10-day battery.',
      price: 12999,
      mrp: 19999,
      currency: 'INR',
      category: 'Wearables',
      rating: 4.2,
      inStock: true,
    },
    {
      id: 'p-7',
      name: 'Fresh Strawberries 500g',
      description: 'Farm-fresh, hand-picked this morning.',
      price: 199,
      mrp: 299,
      currency: 'INR',
      category: 'Daily Essentials',
      rating: 4.6,
      inStock: true,
    },
    {
      id: 'p-8',
      name: 'Alphonso Mangoes 1kg',
      description: 'Premium Ratnagiri Alphonso, naturally ripened.',
      price: 349,
      mrp: 499,
      currency: 'INR',
      category: 'Daily Essentials',
      rating: 4.8,
      inStock: false,
    },
  ];
}
