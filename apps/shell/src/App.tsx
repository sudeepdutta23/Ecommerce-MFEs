import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Zap, Search, User, MapPin } from 'lucide-react'
import { on } from '@ecom/event-bus'
import './index.css'
import './App.css'

// ─── Lazy MFE Loaders ─────────────────────────────────────────
function ProductsMfeLoader({ retryKey }: { retryKey: number }) {
  const LazyProductsMfe = React.useMemo(
    () =>
      React.lazy(async () => {
        const module = await import('productsMfe/App')
        const mount = module.default as unknown as (el: HTMLElement) => (() => void)
        return {
          default: function ProductsRemote() {
            const ref = React.useRef<HTMLDivElement>(null)
            useEffect(() => {
              let unmount: () => void
              if (ref.current) {
                unmount = mount(ref.current)
              }
              return () => {
                if (unmount) unmount()
              }
            }, [])
            return <div ref={ref} />
          }
        }
      }),
    [retryKey],
  )
  return <LazyProductsMfe />
}

function HomeMfeLoader({ retryKey }: { retryKey: number }) {
  const LazyHomeMfe = React.useMemo(
    () =>
      React.lazy(async () => {
        const module = await import('homeMfe/App')
        const mount = module.default as unknown as (el: HTMLElement) => (() => void)
        return {
          default: function HomeRemote() {
            const ref = React.useRef<HTMLDivElement>(null)
            useEffect(() => {
              let unmount: () => void
              if (ref.current) {
                unmount = mount(ref.current)
              }
              return () => {
                if (unmount) unmount()
              }
            }, [])
            return <div ref={ref} />
          }
        }
      }),
    [retryKey],
  )
  return <LazyHomeMfe />
}

function CartMfeLoader({ retryKey }: { retryKey: number }) {
  const LazyCartMfe = React.useMemo(
    () =>
      React.lazy(async () => {
        const module = await import('cartMfe/CartApp')
        const mount = module.default as unknown as (el: HTMLElement) => (() => void)
        return {
          default: function VueCart() {
            const ref = React.useRef<HTMLDivElement>(null)
            useEffect(() => {
              let unmount: () => void
              if (ref.current) {
                unmount = mount(ref.current)
              }
              return () => {
                if (unmount) unmount()
              }
            }, [])
            return <div ref={ref} />
          }
        }
      }),
    [retryKey],
  )
  return <LazyCartMfe />
}

function AuthMfeLoader({ retryKey }: { retryKey: number }) {
  const LazyAuthMfe = React.useMemo(
    () =>
      React.lazy(async () => {
        const module = await import('authMfe/AuthApp')
        const mount = module.default as unknown as (el: HTMLElement) => (() => void)
        return {
          default: function VueAuth() {
            const ref = React.useRef<HTMLDivElement>(null)
            useEffect(() => {
              let unmount: () => void
              if (ref.current) {
                unmount = mount(ref.current)
              }
              return () => {
                if (unmount) unmount()
              }
            }, [])
            return <div ref={ref} />
          }
        }
      }),
    [retryKey],
  )
  return <LazyAuthMfe />
}

function MfeFallback(name: string) {
  return function Fallback({ onRetry }: { onRetry?: () => void }) {
    return (
      <div className="mfe-offline">
        <div className="mfe-offline__icon">⚡</div>
        <h3>{name} MFE</h3>
        <p>Start the {name.toLowerCase()}-mfe on its port to load this module.</p>
        <code>npm run preview  (port {name === 'Products' ? '3001' : name === 'Cart' ? '3002' : name === 'Home' ? '3004' : name === 'Auth' ? '3005' : '3003'})</code>
        {onRetry && (
          <button className="btn-primary" onClick={onRetry} style={{ marginTop: '1rem' }}>
            Retry Loading
          </button>
        )}
      </div>
    )
  }
}

class MfeErrorBoundary extends React.Component<
  { name: string, retryKey: number, onRetry: () => void, children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidUpdate(prevProps: { retryKey: number }) {
    if (prevProps.retryKey !== this.props.retryKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      const Fallback = MfeFallback(this.props.name)
      return <Fallback onRetry={this.props.onRetry} />
    }
    return this.props.children
  }
}

// ─── Checkout MFE Loader (Angular via iframe - seamless integration) ───────
function CheckoutMfeLoader({ retryKey }: { retryKey: number }) {
  const LazyCheckoutMfe = React.useMemo(
    () =>
      React.lazy(async () => {
        return {
          default: function CheckoutRemote() {
            const ref = React.useRef<HTMLDivElement>(null);

            useEffect(() => {
              if (!ref.current) return;

              ref.current.innerHTML = '';

              const iframe = document.createElement('iframe');
              iframe.src = 'http://localhost:3003/';
              iframe.style.width = '100%';
              iframe.style.height = '900px';
              iframe.style.border = 'none';
              iframe.style.background = 'transparent';
              iframe.setAttribute('title', 'Checkout');

              ref.current.appendChild(iframe);

              return () => {
                if (ref.current) {
                  ref.current.innerHTML = '';
                }
              };
            }, []);

            return <div ref={ref} style={{ width: '100%' }} />;
          }
        }
      }),
    [retryKey],
  )

  return (
    <React.Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', minHeight: '600px' }}>Loading checkout...</div>}>
      <LazyCheckoutMfe />
    </React.Suspense>
  )
}

// ─── Checkout Page ──────────────────────────────
function CheckoutPage() {
  return (
    <div style={{ width: '100%' }}>
      <CheckoutMfeLoader retryKey={0} />
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────
function Navbar({ cartCount }: { cartCount: number }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  const navLinks = [
    { to: '/products', label: 'Products' },
    { to: '/cart', label: 'Cart' },
    { to: '/checkout', label: 'Checkout' },
  ]

  const secondaryLinks = [
    "Today's Deals",
    'Customer Service',
    'Registry',
    'Gift Cards',
    'Sell',
  ]

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="HarborMart home">
          <div className="navbar__logo">
            <Zap size={20} strokeWidth={2.5} />
          </div>
          <span className="navbar__brand-name">HarborMart</span>
        </Link>

        <div className="navbar__search" role="search">
          <label htmlFor="nav-category-select" className="sr-only">Search category</label>
          <select id="nav-category-select" className="navbar__search-select" aria-label="Search category" defaultValue="all">
            <option value="all">All</option>
            <option value="electronics">Electronics</option>
            <option value="wearables">Wearables</option>
            <option value="audio">Audio</option>
          </select>
          <label htmlFor="nav-search-input" className="sr-only">Search products</label>
          <input id="nav-search-input" className="navbar__search-input" type="search" aria-label="Search products" placeholder="Search HarborMart" />
          <button className="navbar__search-submit" aria-label="Search HarborMart">
            <Search size={22} />
          </button>
        </div>

        <div className="navbar__actions">
          <button className="navbar__text-btn navbar__deliver" aria-label="Delivery location" title="Delivery location">
            <MapPin size={18} />
            <span className="navbar__text-stack">
              <span className="navbar__text-top">Deliver to</span>
              <span className="navbar__text-bottom">Your area</span>
            </span>
          </button>
          <Link to="/auth" className="navbar__text-btn" aria-label="Account" title="Account">
            <User size={18} />
            <span className="navbar__text-stack">
              <span className="navbar__text-top">Hello, sign in</span>
              <span className="navbar__text-bottom">Account & Lists</span>
            </span>
          </Link>
          <Link to="/cart" className="navbar__cart-btn" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingCart size={20} />
            <span className="navbar__cart-label">Cart</span>
            {cartCount > 0 && (
              <span className="navbar__cart-badge" aria-live="polite">{cartCount}</span>
            )}
          </Link>
          <button
            className="navbar__hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className="navbar__sub" aria-label="Browse categories">
        <div className="navbar__sub-inner">
          <Link to="/" className={`navbar__sub-link navbar__sub-link--menu ${location.pathname === '/' ? 'navbar__sub-link--active' : ''}`}>
            <Menu size={16} />
            <span>All</span>
          </Link>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__sub-link ${location.pathname === link.to ? 'navbar__sub-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {secondaryLinks.map(label => (
            <button key={label} className="navbar__sub-link" type="button">
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar__mobile">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="navbar__mobile-link">{link.label}</Link>
          ))}
        </div>
      )}
    </nav>
  )
}

// ─── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo"><Zap size={16} /></div>
          <span>HarborMart</span>
        </div>
        <p className="footer__tagline">Shop smarter with HarborMart.</p>
        <div className="footer__tech">
          {['Fast delivery', 'Secure checkout', 'Easy returns', '24/7 support'].map(t => (
            <span key={t} className="badge badge-primary">{t}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── App ──────────────────────────────────────────────────────
function AppInner() {
  const [cartCount, setCartCount] = useState(0)
  const [productsRetryKey, setProductsRetryKey] = useState(0)
  const [homeRetryKey, setHomeRetryKey] = useState(0)
  const [cartRetryKey, setCartRetryKey] = useState(0)
  const [authRetryKey, setAuthRetryKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const offCart = on('ecom:cart:updated', ({ count }) => {
      setCartCount(count)
    })
    const offCheckout = on('ecom:checkout:start', () => {
      navigate('/checkout')
    })
    const handleAuthSuccess = () => {
      navigate('/')
    }
    window.addEventListener('auth:login_success', handleAuthSuccess)
    return () => {
      offCart()
      offCheckout()
      window.removeEventListener('auth:login_success', handleAuthSuccess)
    }
  }, [navigate])

  return (
    <>
      <a href="#main-content" className="skip-link sr-only focusable" style={{ position: 'absolute', top: 0, left: 0, zIndex: 9999, padding: '1rem', background: 'var(--color-primary)', color: '#fff' }} onFocus={(e) => { e.currentTarget.classList.remove('sr-only'); e.currentTarget.style.position = 'absolute' }} onBlur={(e) => e.currentTarget.classList.add('sr-only')}>Skip to main content</a>
      <Navbar cartCount={cartCount} />
      <main className="mfe-container" id="main-content" role="main">
        <React.Suspense fallback={<MfeLoadingSpinner />}>
          <Routes>
            <Route
              path="/"
              element={
                <MfeErrorBoundary
                  name="Home"
                  retryKey={homeRetryKey}
                  onRetry={() => setHomeRetryKey(k => k + 1)}
                >
                  <HomeMfeLoader retryKey={homeRetryKey} />
                </MfeErrorBoundary>
              }
            />
            <Route
              path="/products"
              element={
                <MfeErrorBoundary
                  name="Products"
                  retryKey={productsRetryKey}
                  onRetry={() => setProductsRetryKey(k => k + 1)}
                >
                  <ProductsMfeLoader retryKey={productsRetryKey} />
                </MfeErrorBoundary>
              }
            />
            <Route
              path="/cart"
              element={
                <MfeErrorBoundary
                  name="Cart"
                  retryKey={cartRetryKey}
                  onRetry={() => setCartRetryKey(k => k + 1)}
                >
                  <CartMfeLoader retryKey={cartRetryKey} />
                </MfeErrorBoundary>
              }
            />
            <Route
              path="/auth"
              element={
                <MfeErrorBoundary
                  name="Auth"
                  retryKey={authRetryKey}
                  onRetry={() => setAuthRetryKey(k => k + 1)}
                >
                  <AuthMfeLoader retryKey={authRetryKey} />
                </MfeErrorBoundary>
              }
            />
            <Route
              path="/checkout"
              element={
                <MfeErrorBoundary
                  name="Checkout"
                  retryKey={0}
                  onRetry={() => window.location.reload()}
                >
                  <CheckoutPage />
                </MfeErrorBoundary>
              }
            />
          </Routes>
        </React.Suspense>
      </main>
      <Footer />
    </>
  )
}

function MfeLoadingSpinner() {
  return (
    <div className="mfe-loading">
      <div className="mfe-loading__spinner" role="status" aria-label="Loading module">
        <div className="spinner"></div>
      </div>
      <p>Loading module…</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
