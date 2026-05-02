import { StrictMode, useState, useCallback, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { useAppDispatch, useAppSelector } from './hooks/useAppStore'
import { setCategory, setSearch, setSortBy, setViewMode } from './store/productsSlice'
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
} from './store/api/productsApi'
import ProductCard from './components/ProductCard/ProductCard'
import type { Product } from './types/product.types'
import { emit } from '@ecom/event-bus'
import { Search, LayoutGrid, List, X, ShoppingCart, Star } from 'lucide-react'
import './index.css'

// ─── Toast System ─────────────────────────────────────────────
interface Toast { id: string; product: Product }

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (toasts.length === 0) return
    const last = toasts[toasts.length - 1]
    const t = setTimeout(() => onRemove(last.id), 3000)
    return () => clearTimeout(t)
  }, [toasts, onRemove])

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className="toast">
          <div className="toast__icon">🛒</div>
          <div className="toast__text">
            <div className="toast__name">{toast.product.name}</div>
            <div className="toast__sub">Added to cart!</div>
          </div>
          <button onClick={() => onRemove(toast.id)} aria-label="Dismiss" style={{ background:'none',border:'none',color:'var(--color-text-muted)',cursor:'pointer' }}>✕</button>
        </div>
      ))}
    </div>
  )
}

// ─── Product Detail Modal ──────────────────────────────────────
function ProductModal({ product, onClose, onAddToCart }: { product: Product; onClose: () => void; onAddToCart: (p: Product) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  return (
    <div className="product-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="product-modal">
        <div className="product-modal__header">
          <h2 id="modal-title">{product.brand} — {product.category}</h2>
          <button className="product-modal__close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        <div className="product-modal__body">
          <img src={product.image} alt={product.name} className="product-modal__image" />
          <div className="product-modal__info">
            <span className="product-modal__brand">{product.brand}</span>
            <h3 className="product-modal__name">{product.name}</h3>
            <div className="star-rating">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} fill={i <= Math.floor(product.rating) ? '#FFB347' : 'transparent'} color={i <= Math.floor(product.rating) ? '#FFB347' : '#5C5C7A'} />
              ))}
              <span className="star-rating__value">{product.rating}</span>
              <span style={{fontSize:'12px',color:'var(--color-text-muted)',marginLeft:'6px'}}>({product.reviewCount.toLocaleString()})</span>
            </div>
            <p className="product-modal__description">{product.description}</p>
            <div className="product-modal__tags">
              {product.tags.map(t => <span key={t} className="product-modal__tag">#{t}</span>)}
            </div>
            <div style={{display:'flex',alignItems:'baseline',gap:'12px'}}>
              <span className="product-modal__price">${product.price.toFixed(2)}</span>
              {discount > 0 && <span style={{color:'var(--color-text-muted)',textDecoration:'line-through',fontSize:'16px'}}>${product.originalPrice.toFixed(2)}</span>}
              {discount > 0 && <span style={{background:'#cc0c39',color:'white',padding:'2px 8px',borderRadius:'6px',fontSize:'12px',fontWeight:'700'}}>-{discount}%</span>}
            </div>
            <p style={{fontSize:'13px',color:product.stock <= 5 ? '#b12704' : 'var(--color-success)',fontWeight:'600'}}>
              {product.stock <= 5 ? `⚠ Only ${product.stock} left in stock!` : `✓ In Stock (${product.stock} units)`}
            </p>
            <button className="product-modal__add-btn" onClick={() => { onAddToCart(product); onClose() }} aria-label={`Add ${product.name} to cart`}>
              <ShoppingCart size={18} /> Add to Cart — ${product.price.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line skeleton-line--sm" />
        <div className="skeleton skeleton-line skeleton-line--lg" />
        <div className="skeleton skeleton-line skeleton-line--md" />
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  )
}

// ─── Main Products Content ─────────────────────────────────────
function ProductsContent() {
  const dispatch = useAppDispatch()
  const { filters, viewMode } = useAppSelector(s => s.products)
  const [selectedProduct, setSelectedProductLocal] = useState<Product | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const { data: products, isLoading, isFetching } = useGetProductsQuery(filters)
  const { data: categories } = useGetCategoriesQuery()

  const handleAddToCart = useCallback((product: Product) => {
    // Emit cross-MFE event via shared event bus
    emit('ecom:cart:add', { product: { id: product.id, name: product.name, price: product.price, image: product.image, brand: product.brand } })
    setToasts(prev => [...prev.slice(-2), { id: Date.now().toString(), product }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const loading = isLoading || isFetching

  return (
    <div className="products-page">
      {/* Hero */}
      <section className="products-hero" aria-label="Products hero">
        <div className="products-hero__eyebrow">HarborMart Picks</div>
        <h1>Great prices on tech and everyday essentials</h1>
        <p className="products-hero__sub">Shop new arrivals, top-rated gear, and limited-time deals</p>
      </section>

      {/* Toolbar */}
      <div className="products-toolbar" role="search">
        <div className="search-box">
          <Search size={16} className="search-box__icon" aria-hidden />
          <input
            id="product-search"
            type="search"
            className="search-box__input"
            placeholder="Search HarborMart products, brands, tags"
            value={filters.search || ''}
            onChange={e => dispatch(setSearch(e.target.value))}
            aria-label="Search products"
          />
        </div>
        <select
          id="product-sort"
          className="toolbar-select"
          value={filters.sortBy || 'default'}
          onChange={e => dispatch(setSortBy(e.target.value as any))}
          aria-label="Sort products"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
        <div className="view-toggle" role="group" aria-label="View mode">
          <button
            id="view-grid"
            className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`}
            onClick={() => dispatch(setViewMode('grid'))}
            aria-label="Grid view" aria-pressed={viewMode === 'grid'}
          ><LayoutGrid size={16} /></button>
          <button
            id="view-list"
            className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`}
            onClick={() => dispatch(setViewMode('list'))}
            aria-label="List view" aria-pressed={viewMode === 'list'}
          ><List size={16} /></button>
        </div>
      </div>

      {/* Category Pills */}
      <nav className="category-pills" aria-label="Filter by category">
        {(categories || []).map(cat => (
          <button
            key={cat}
            id={`cat-${cat.toLowerCase().replace(/\s/g,'-')}`}
            className={`category-pill ${filters.category === cat ? 'category-pill--active' : ''}`}
            onClick={() => dispatch(setCategory(cat))}
            aria-pressed={filters.category === cat}
          >{cat}</button>
        ))}
      </nav>

      {/* Results bar */}
      {!loading && (
        <div className="results-bar">
          <p className="results-bar__count">
            Showing <strong>{products?.length ?? 0}</strong> products
            {filters.category && filters.category !== 'All' && ` in ${filters.category}`}
          </p>
          {(filters.search || (filters.category && filters.category !== 'All')) && (
            <button
              onClick={() => { dispatch(setSearch('')); dispatch(setCategory('All')) }}
              style={{ background:'none', border:'none', color:'var(--color-text-muted)', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontSize:'13px' }}
              aria-label="Clear filters"
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      <section className={`products-grid ${viewMode === 'list' ? 'products-grid--list' : ''}`} aria-label="Product listing" aria-busy={loading}>
        {loading
          ? Array.from({ length: 8 }, (_, i) => <ProductSkeleton key={i} />)
          : products?.length === 0
          ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state__icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button onClick={() => { dispatch(setSearch('')); dispatch(setCategory('All')) }}>
                Reset Filters
              </button>
            </div>
          )
          : products?.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onViewDetail={setSelectedProductLocal}
            />
          ))
        }
      </section>

      {/* Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProductLocal(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

// ─── Bootstrap Exports ────────────────────────────────────────
export function ProductsApp() {
  return (
    <Provider store={store}>
      <ProductsContent />
    </Provider>
  )
}

export default function mountProducts(el: HTMLElement | string) {
  const container = typeof el === 'string' ? document.querySelector(el) : el
  if (!container) {
    throw new Error('Products MFE mount point not found')
  }

  const root: Root = createRoot(container)
  root.render(
    <StrictMode>
      <ProductsApp />
    </StrictMode>,
  )

  return () => root.unmount()
}
