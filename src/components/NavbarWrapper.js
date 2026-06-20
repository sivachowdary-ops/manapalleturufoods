'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, ShoppingBag, MessageCircle, Menu, X } from 'lucide-react';

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('918143995777');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mp_settings_whatsapp');
      if (stored && stored.length === 10) {
        setWhatsappNumber(`91${stored}`);
      } else {
        const envNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918143995777';
        if (envNum.length === 10) {
          setWhatsappNumber(`91${envNum}`);
        } else {
          setWhatsappNumber(envNum.replace('+', ''));
        }
      }
    }
  }, []);

  // Hide customer navbar and announcement bar on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleScrollToGrid = (e, id) => {
    if (pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Home', href: '/', id: 'home' },
    { label: 'Best Sellers', href: '/#combos', id: 'combos' },
    { label: 'Our Pickles', href: '/#pickles', id: 'pickles' },
    { label: 'About Us', href: '/#about', id: 'about' },
    { label: 'Reviews', href: '/#reviews', id: 'reviews' },
    { label: 'How to Order', href: '/#how-to-order', id: 'how-to-order' },
    { label: 'Contact Us', href: '/#contact', id: 'contact' }
  ];

  return (
    <div className="top-header-container">
      {/* 1. Sticky Scrolling Marquee Announcement Bar */}
      <div className="announcement-bar">
        <div className="marquee-container">
          <div className="marquee-content">
            <span>🌿 No Artificial Colors  ◆  No Preservatives  ◆  Made With Love  ◆  100% Natural Ingredients</span>
            <span>🌿 No Artificial Colors  ◆  No Preservatives  ◆  Made With Love  ◆  100% Natural Ingredients</span>
            <span>🌿 No Artificial Colors  ◆  No Preservatives  ◆  Made With Love  ◆  100% Natural Ingredients</span>
            <span>🌿 No Artificial Colors  ◆  No Preservatives  ◆  Made With Love  ◆  100% Natural Ingredients</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="navbar">
        <div className="navbar-container">
          <Link href="/" className="logo-link" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="logo-image-wrapper" style={{ minWidth: '60px' }}>
              <Image 
                src="/logo.png" 
                alt="Mana Palleturu Foods Logo" 
                fill 
                style={{ objectFit: 'contain' }}
                sizes="60px"
                priority
              />
            </div>
            <div className="logo-text">
              Mana <span>Palleturu</span> Foods
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            <ul className="nav-links">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href} 
                    onClick={(e) => {
                      if (item.id === 'home' && pathname === '/') {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (item.id !== 'home') {
                        handleScrollToGrid(e, item.id);
                      }
                    }} 
                    className={`nav-link ${
                      item.id === 'home' && pathname === '/'
                        ? 'active'
                        : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-actions">
            {/* Cart Icon Trigger */}
            <Link href="/cart" className="cart-icon-btn" aria-label="Shopping Cart" onClick={() => setIsMobileMenuOpen(false)}>
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button 
              className="hamburger-toggle" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Mobile Hamburger Navigation Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.id === 'home' && pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  } else if (item.id !== 'home') {
                    handleScrollToGrid(e, item.id);
                  } else {
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`mobile-nav-link ${
                  item.id === 'home' && pathname === '/' ? 'active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* 4. Consolidated Floating Action Buttons (WhatsApp & Cart) */}
      <div className="floating-actions-container">
        {/* WhatsApp Floating Button */}
        <a 
          href={`https://wa.me/${whatsappNumber}?text=Hi%2C%20I%20have%20a%20question%20about%20Mana%20Palleturu%20Foods.`} 
          className="floating-btn whatsapp" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.451L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.38 2.016 13.908.993 12.01.993c-5.462 0-9.902 4.37-9.906 9.8-.001 2.03.55 4.015 1.597 5.811l-1.01 3.687 3.774-.973zm11.233-6.16c-.3-.15-1.77-.875-2.04-.972-.27-.099-.465-.15-.66.15-.195.3-.75.972-.92 1.17-.17.195-.34.21-.64.06-3.002-1.498-4.22-2.583-5.86-5.4-.435-.747.435-.69.87-1.425.135-.225.06-.42-.03-.57-.09-.15-.75-1.8-1.03-2.475-.27-.655-.55-.567-.75-.577-.19-.01-.41-.01-.63-.01-.22 0-.58.08-.885.42-.305.34-1.16 1.134-1.16 2.766 0 1.63 1.19 3.199 1.35 3.42.16.22 2.333 3.535 5.65 4.96.79.34 1.405.542 1.885.694.793.25 1.517.215 2.086.13.635-.095 1.77-.72 2.02-1.38.25-.66.25-1.23.175-1.38-.075-.15-.27-.24-.57-.39z"/>
          </svg>
        </a>

        {/* Cart Floating Button (Always visible on mobile/desktop when cart has items) */}
        {cartCount > 0 && (
          <Link 
            href="/cart" 
            className="floating-btn cart" 
            aria-label="View Shopping Cart"
          >
            <ShoppingBag size={24} />
            <span className="floating-cart-badge">{cartCount}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
