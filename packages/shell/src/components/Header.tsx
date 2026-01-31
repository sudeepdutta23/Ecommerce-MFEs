
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { eventBus, EVENTS } from '@ecommerce/shared';
import styles from './Header.module.css';

export default function Header() {
    const [cartCount, setCartCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        // Listen for cart updates
        const unsubscribe = eventBus.on(EVENTS.CART_UPDATED, (data: any) => {
            setCartCount(data?.itemCount || 0);
        });

        // Handle scroll for header blur effect
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            unsubscribe();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const navItems = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/cart', label: 'Cart' },
        { href: '/checkout', label: 'Checkout' },
        { href: '/profile', label: 'Profile' },
        { href: '/admin', label: 'Admin' },
    ];

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>🛍️</span>
                    <span className={styles.logoText}>MicroStore</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className={styles.desktopNav}>
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className={styles.navLink}>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Section */}
                <div className={styles.rightSection}>
                    {/* Search */}
                    <button className={styles.iconButton} aria-label="Search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>

                    {/* Cart */}
                    <Link href="/cart" className={styles.cartButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {cartCount > 0 && (
                            <span className={styles.cartBadge}>{cartCount}</span>
                        )}
                    </Link>

                    {/* Profile */}
                    <Link href="/profile" className={styles.iconButton} aria-label="Profile">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={styles.menuToggle}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}></span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <nav className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ''}`}>
                {navItems.map((item, index) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={styles.mobileNavLink}
                        onClick={() => setIsMenuOpen(false)}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </header>
    );
}
