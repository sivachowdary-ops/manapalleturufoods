'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { getProductById, getComboById } from '@/lib/db';
import { ShoppingCart, ArrowLeft, Shield, Sparkles, Award } from 'lucide-react';

function ProductDetailContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isComboQuery = searchParams.get('isCombo') === 'true' || id.startsWith('c');
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState('500gms'); // '500gms' or '1kg'
  const [quantity, setQuantity] = useState(1);
  const [addedNotify, setAddedNotify] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [activeCropIdx, setActiveCropIdx] = useState(0);
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchItem() {
      try {
        let fetchedData = null;
        if (isComboQuery) {
          fetchedData = await getComboById(id);
          setSelectedWeight('1kg (Combo Pack)');
        } else {
          fetchedData = await getProductById(id);
          setSelectedWeight('500gms');
        }
        
        if (fetchedData) {
          setItem(fetchedData);
          setActiveImage(fetchedData.image_url);
        } else {
          console.error("Item not found");
        }
      } catch (e) {
        console.error("Error fetching product", e);
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [id, isComboQuery]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--color-accent-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Fetching product details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '0 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Product Not Found</h2>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>The product you are looking for does not exist or has been removed from our catalog.</p>
        <Link href="/" className="hero-btn">Return to Shop</Link>
      </div>
    );
  }

  // Calculate dynamic price based on selection
  const price = isComboQuery 
    ? item.price 
    : (selectedWeight === '1kg' ? item.price_1kg : item.price_500gms);

  const handleAddToCart = () => {
    addToCart(item, selectedWeight, price, quantity);
    setAddedNotify(true);
    setTimeout(() => {
      setAddedNotify(false);
    }, 3000);
  };

  const cropLabels = ['Original View', 'Masala Glaze', 'Traditional Clay'];

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', paddingBottom: '4rem' }}>
      {/* Back button */}
      <div style={{ maxWidth: '1100px', margin: '2rem auto 0', padding: '0 2rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)', fontWeight: 650, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Pickles
        </Link>
      </div>

      <div className="detail-container">
        {/* Left Side: Product Image & Gallery/Info Blocks */}
        <div>
          <div className="detail-img-container" style={{ height: '400px', marginBottom: '1rem' }}>
            <Image 
              src={activeImage || item.image_url} 
              alt={item.name} 
              fill
              style={{ 
                objectFit: 'cover',
                filter: activeCropIdx === 1 ? 'brightness(1.05) contrast(1.15)' : activeCropIdx === 2 ? 'saturate(1.1) brightness(0.95)' : 'none' 
              }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Interactive Thumbnail Gallery Strip */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {cropLabels.map((label, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setActiveImage(item.image_url);
                  setActiveCropIdx(idx);
                }}
                style={{
                  flex: 1,
                  position: 'relative',
                  height: '70px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: `2px solid ${activeCropIdx === idx ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition)'
                }}
              >
                <Image 
                  src={item.image_url} 
                  alt={`${item.name} crop ${idx}`} 
                  fill 
                  style={{ 
                    objectFit: 'cover',
                    filter: idx === 1 ? 'brightness(1.05) contrast(1.15)' : idx === 2 ? 'saturate(1.1) brightness(0.95)' : 'none' 
                  }}
                  sizes="100px"
                />
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: activeCropIdx === idx ? 'var(--color-primary)' : 'rgba(107, 30, 35, 0.75)',
                  color: '#FFFFFF',
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  padding: '2px 0',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Why You'll Love This / Storage & Shelf Life Info Block */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🌿 Why You'll Love This
              </h3>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--color-text-light)', display: 'flex', flexDirection: 'column', gap: '0.3rem', lineHeight: 1.4 }}>
                <li>Premium farm-fresh meats (100% boneless cuts).</li>
                <li>Marinated in natural cold-pressed groundnut oil.</li>
                <li>Fresh hand-ground spices and organic lemon juice.</li>
                <li>Slow-cooked in small batches using traditional Andhra recipes.</li>
              </ul>
            </div>
            
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📅 Storage & Shelf Life
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', lineHeight: 1.5 }}>
                <strong>Shelf Life:</strong> 6 Months from packaging.<br />
                <strong>Storage:</strong> Store in a cool, dry place. Always use a dry spoon. Keep the jar tightly sealed. Refrigeration is recommended after opening to preserve flavor.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="detail-info">
          <span className="detail-tagline">
            {isComboQuery ? '⭐ Best Seller Combo' : '🏺 Premium Non-Veg Pickle'}
          </span>
          <h1 className="detail-name">{item.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              ₹{price}
            </span>
            <span style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-primary-dark)', fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--color-primary)' }}>
              {selectedWeight === '500gms' ? '500 Grams Pack' : '1.0 KG Pack'}
            </span>
          </div>

          <p className="detail-description">{item.description}</p>

          {/* Combo content details vs individual pickle weight toggle */}
          {isComboQuery ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="selector-label">Combo Contents Include:</div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {Array.isArray(item.contents) && item.contents.map((prod, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>• {prod.name}</span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{prod.weight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="selector-label">Select Package Weight:</div>
              <div className="weight-selector-grid">
                <label>
                  <input 
                    type="radio" 
                    name="weight" 
                    className="weight-radio" 
                    checked={selectedWeight === '500gms'}
                    onChange={() => setSelectedWeight('500gms')}
                  />
                  <div className="weight-btn">
                    <span className="weight-label">500 Grams</span>
                    <span className="weight-price">₹{item.price_500gms}</span>
                  </div>
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="weight" 
                    className="weight-radio" 
                    checked={selectedWeight === '1kg'}
                    onChange={() => setSelectedWeight('1kg')}
                  />
                  <div className="weight-btn">
                    <span className="weight-label">1.0 Kilogram</span>
                    <span className="weight-price">₹{item.price_1kg}</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Quantity selector + Buy Button */}
          <div className="qty-buy-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#53685B', textTransform: 'uppercase' }}>Quantity</span>
              <div className="quantity-control">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity">-</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => q + 1)} aria-label="Increase quantity">+</button>
              </div>
            </div>

            <button 
              className="add-to-cart-btn detail-buy-btn"
              onClick={handleAddToCart}
              style={{ marginTop: 'auto' }}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>

          {/* Success message banner */}
          {addedNotify && (
            <div 
              style={{
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success)',
                color: 'var(--color-success)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: 'pulse 1.5s infinite'
              }}
            >
              <span>Added successfully! {quantity} x {item.name} ({selectedWeight}) now in cart.</span>
              <Link href="/cart" style={{ textDecoration: 'underline', color: 'var(--color-primary-dark)' }}>
                View Cart
              </Link>
            </div>
          )}

          {/* Extra product trust markers */}
          <div className="meta-info-box">
            <div className="meta-item">
              <Shield size={16} style={{ color: 'var(--color-accent)' }} />
              <span>Prepared in 100% hygienic, sterile rural kitchen conditions.</span>
            </div>
            <div className="meta-item">
              <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
              <span>Freshly packed in secure leak-proof jars to preserve oil glazing.</span>
            </div>
            <div className="meta-item">
              <Award size={16} style={{ color: 'var(--color-accent)' }} />
              <span>Shipping charges are extra and will be confirmed separately via WhatsApp.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--color-accent-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Loading product content...</p>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}
