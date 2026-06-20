'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Leaf, Shield, Star, Globe, Check } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide customer footer on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer id="contact" className="footer" style={{ padding: 0 }}>
      {/* 1. Features Bar */}
      <div className="features-bar">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Leaf size={32} />
            </div>
            <div className="feature-info">
              <h4>Freshly Prepared</h4>
              <p>Made in small batches upon order receipt.</p>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Shield size={32} />
            </div>
            <div className="feature-info">
              <h4>Hygienically Packed</h4>
              <p>Strict sanitation standards and double-sealed packs.</p>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Star size={32} />
            </div>
            <div className="feature-info">
              <h4>Premium Ingredients</h4>
              <p>Prepared using cold-pressed oils and handpicked spices.</p>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Globe size={32} />
            </div>
            <div className="feature-info">
              <h4>Delivered Across India</h4>
              <p>Reliable courier partners tracking to your doorstep.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer columns */}
      <div className="footer-grid" style={{ padding: '5rem 2rem 3rem' }}>
        {/* Column 1: Brand Info */}
        <div className="footer-col footer-col-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="footer-logo-wrapper">
              <Image 
                src="/logo.png" 
                alt="Mana Palleturu Foods Logo" 
                fill 
                style={{ objectFit: 'contain' }}
                sizes="70px"
              />
            </div>
            <div>
              <span className="footer-brand-title">Mana Palleturu Foods</span>
              <span className="footer-brand-subtitle">Traditional & Authentic</span>
            </div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-accent-light)', opacity: 0.85, lineHeight: 1.6 }}>
            Serving authentic homemade village-style pickles for over 10 years. Crafting rich, slow-cooked non-vegetarian chicken, mutton, prawn, and fish pickles with love and pure ingredients.
          </p>
          <div className="social-links">
            <a href="https://instagram.com/manapalleturufoods" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Youtube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>

        {/* Column 2: Contact Info */}
        <div className="footer-col">
          <h4>Contact Us</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', color: 'var(--color-accent-light)', opacity: 0.85 }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Phone size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#FFFFFF', fontSize: '1.05rem', display: 'block' }}>+91 81439 95777</strong>
                <strong style={{ color: '#FFFFFF', fontSize: '1.05rem', display: 'block', marginTop: '0.25rem' }}>+91 99899 92377</strong>
                <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.4rem' }}>Mon-Sun: 9AM - 9PM IST</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Mail size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <span>manapalleturufoods@gmail.com</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <MapPin size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <div style={{ lineHeight: 1.5 }}>
                <strong style={{ color: '#FFFFFF' }}>Manufactured By:</strong><br />
                Chandrika Reddy Home Made Foods,<br />
                Sy no.318/A, H.no.5-208, ORR Service Road,<br />
                Maheshwaram Mandal, Tukkuguda,<br />
                Rangareddy, Telangana - 501359.
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Our Promise */}
        <div className="footer-col">
          <h4>Our Promise</h4>
          <ul className="promise-list">
            <li className="promise-item">
              <Check size={16} /> No Added Colors
            </li>
            <li className="promise-item">
              <Check size={16} /> No Palm Oil (Cold-Pressed Only)
            </li>
            <li className="promise-item">
              <Check size={16} /> No Synthetic Preservatives
            </li>
            <li className="promise-item">
              <Check size={16} /> 100% Homemade Village Recipes
            </li>
            <li className="promise-item">
              <Check size={16} /> Traditional Clay Pot Preparation
            </li>
            <li className="promise-item">
              <Check size={16} /> Pan India Shipping
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Mana Palleturu Foods. All Rights Reserved.</p>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: 0.8 }}>
          Designed and Developed by <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Siva & Astra AI Solutions</span>
        </p>
      </div>
    </footer>
  );
}
