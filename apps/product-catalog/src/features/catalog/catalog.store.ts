import { makeAutoObservable, runInAction } from 'mobx';
import { type Product } from '@ecom/types';
import {
  addProductToCart,
  apiErrorMessage,
  assetUrl,
  catalogApi,
  eventBus,
  firstImageUrl,
  getCartCount,
  type Category,
  type StorefrontProduct,
  type StorefrontSort,
} from '@ecom/utils';

const PAGE_SIZE = 12;
const SEARCH_DELAY_MS = 300;

function toProduct(product: StorefrontProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? '',
    price: product.price,
    currency: product.currency,
    category: product.category?.name ?? '',
    categorySlug: product.category?.slug,
    sellerName: product.seller.name,
    inStock: product.inStock,
    imageUrl: firstImageUrl(product),
    images: product.images.map(assetUrl),
  };
}

/**
 * MobX store PRIVATE to the product-catalog MFE.
 *
 * Instantiated per mount and provided via React context (see CatalogProvider).
 * The backend searches, filters, sorts and pages (GET /catalog/products); this
 * store holds the query and the current page of results. The only outbound
 * signals are event-bus emissions defined by the shared contract.
 */
export class CatalogStore {
  products: Product[] = [];
  categories: Category[] = [];
  total = 0;
  totalPages = 1;
  /** One-based, for display; the API counts from zero. */
  page = 1;
  query = '';
  /** A category slug, or 'all'. */
  category = 'all';
  sort: StorefrontSort | '' = '';
  inStockOnly = false;
  minPrice = '';
  maxPrice = '';
  status: 'idle' | 'loading' | 'error' = 'idle';
  errorMessage = '';

  product: Product | null = null;
  relatedProducts: Product[] = [];
  productStatus: 'idle' | 'loading' | 'notFound' | 'error' = 'idle';

  cartCount = getCartCount();
  cartError = '';

  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  /** Drops an answer that arrives after a newer request was made. */
  private latestRequest = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get categoryName(): string {
    return this.categories.find((category) => category.slug === this.category)?.name ?? 'Everything';
  }

  /** 1-based index range of the visible page, for the "Showing x–y of z" line. */
  get pageRange(): { from: number; to: number; total: number } {
    if (this.total === 0) return { from: 0, to: 0, total: 0 };
    const from = (this.page - 1) * PAGE_SIZE + 1;
    return { from, to: Math.min(from + PAGE_SIZE - 1, this.total), total: this.total };
  }

  /** Apply the URL's filters (the shell's search box and category pills) in one reload. */
  applyUrlFilters(query: string | null, category: string | null): void {
    if (query !== null) this.query = query;
    if (category !== null) this.category = category;
    this.page = 1;
    void this.loadProducts();
  }

  setQuery(query: string): void {
    this.query = query;
    this.page = 1;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => void this.loadProducts(), SEARCH_DELAY_MS);
  }

  setCategory(category: string): void {
    this.category = category;
    this.page = 1;
    void this.loadProducts();
  }

  setSort(sort: StorefrontSort | ''): void {
    this.sort = sort;
    this.page = 1;
    void this.loadProducts();
  }

  setInStockOnly(inStockOnly: boolean): void {
    this.inStockOnly = inStockOnly;
    this.page = 1;
    void this.loadProducts();
  }

  setPriceRange(minPrice: string, maxPrice: string): void {
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
    this.page = 1;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => void this.loadProducts(), SEARCH_DELAY_MS);
  }

  setPage(page: number): void {
    this.page = Math.min(Math.max(1, page), this.totalPages);
    void this.loadProducts();
  }

  clearFilters(): void {
    this.query = '';
    this.category = 'all';
    this.sort = '';
    this.inStockOnly = false;
    this.minPrice = '';
    this.maxPrice = '';
    this.page = 1;
    void this.loadProducts();
  }

  async loadCategories(): Promise<void> {
    try {
      const categories = await catalogApi.categories();
      runInAction(() => {
        this.categories = categories;
      });
    } catch {
      // The list still works without its filter pills.
    }
  }

  async loadProducts(): Promise<void> {
    const request = ++this.latestRequest;
    this.status = 'loading';
    try {
      const result = await catalogApi.products({
        q: this.query.trim() || undefined,
        category: this.category === 'all' ? undefined : this.category,
        sort: this.sort || undefined,
        inStock: this.inStockOnly || undefined,
        minPrice: this.minPrice ? Number(this.minPrice) : undefined,
        maxPrice: this.maxPrice ? Number(this.maxPrice) : undefined,
        page: this.page - 1,
        size: PAGE_SIZE,
      });
      if (request !== this.latestRequest) return;
      runInAction(() => {
        this.products = result.content.map(toProduct);
        this.total = result.totalElements;
        this.totalPages = Math.max(1, result.totalPages);
        this.status = 'idle';
      });
    } catch (error) {
      if (request !== this.latestRequest) return;
      runInAction(() => {
        this.status = 'error';
        this.errorMessage = apiErrorMessage(error, 'Could not load the catalog.');
      });
    }
  }

  async loadProduct(productId: string): Promise<void> {
    this.productStatus = 'loading';
    this.product = null;
    this.relatedProducts = [];
    try {
      const product = toProduct(await catalogApi.product(productId));
      runInAction(() => {
        this.product = product;
        this.productStatus = 'idle';
      });
      if (product.categorySlug) {
        const related = await catalogApi.products({ category: product.categorySlug, size: 5 });
        runInAction(() => {
          this.relatedProducts = related.content
            .filter((candidate) => candidate.id !== product.id)
            .slice(0, 4)
            .map(toProduct);
        });
      }
    } catch (error) {
      runInAction(() => {
        // The backend answers 404 for anything not on sale, like an unknown ID.
        const status = (error as { status?: number }).status;
        if (this.product === null) {
          this.productStatus = status === 404 || status === 400 ? 'notFound' : 'error';
        }
      });
    }
  }

  async addToCart(product: Product): Promise<boolean> {
    this.cartError = '';
    try {
      await addProductToCart(product);
    } catch (error) {
      runInAction(() => {
        this.cartError = apiErrorMessage(error, 'Could not add this to your cart.');
      });
      return false;
    }
    runInAction(() => {
      this.cartCount = getCartCount();
    });
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
    return true;
  }
}
