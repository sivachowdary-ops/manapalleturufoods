'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { getProducts, getCombos } from '@/lib/db';
import { ShoppingCart, Award } from 'lucide-react';

export default function HomeClient({ initialProducts, initialCombos, isDbMock }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [combos, setCombos] = useState(initialCombos || []);
  const [loading, setLoading] = useState(!initialProducts || initialProducts.length === 0);
  const { addToCart } = useCart();
  const [addedItemMessage, setAddedItemMessage] = useState(null);
  const [selectedWeights, setSelectedWeights] = useState({});

  useEffect(() => {
    // If in production/Supabase mode and we have initial data, use it immediately
    if (!isDbMock && initialProducts && initialProducts.length > 0) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const prodData = await getProducts();
        const comboData = await getCombos();
        setProducts(prodData.filter(p => p.in_stock));
        setCombos(comboData.filter(c => c.in_stock));
      } catch (e) {
        console.error("Failed to load catalog data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialProducts, isDbMock]);

  const handleAddComboToCart = (combo, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(combo, '1kg (Combo Pack)', combo.price, 1);
    triggerSuccessNotification(`${combo.name} Added to Cart!`);
  };

  const handleWeightChange = (productId, weight) => {
    setSelectedWeights(prev => ({ ...prev, [productId]: weight }));
  };

  const handleAddProductToCart = (product, e) => {
    e.preventDefault();
    const weight = selectedWeights[product.id] || '500gms';
    const price = weight === '500gms' ? product.price_500gms : product.price_1kg;
    addToCart(product, weight, price, 1);
    triggerSuccessNotification(`${product.name} (${weight === '500gms' ? '500g' : '1kg'}) Added to Cart!`);
  };

  const triggerSuccessNotification = (message) => {
    setAddedItemMessage(message);
    setTimeout(() => {
      setAddedItemMessage(null);
    }, 3000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--color-accent-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Loading authentic pickle catalog...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div id="home">
      {/* 1. Success Toast Notification */}
      {addedItemMessage && (
        <div 
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-primary-dark)',
            color: '#FFFFFF',
            padding: '1rem 2rem',
            borderRadius: '50px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: '1px solid var(--color-accent)',
            animation: 'fadeInUp 0.3s ease-out'
          }}
        >
          <Award size={20} style={{ color: 'var(--color-accent)' }} />
          {addedItemMessage}
          <Link href="/cart" style={{ color: 'var(--color-accent)', textDecoration: 'underline', marginLeft: '0.5rem' }}>
            View Cart
          </Link>
          <style jsx>{`
            @keyframes fadeInUp {
              from { transform: translate(-50%, 1rem); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="hero-section" style={{ backgroundImage: "url('/images/products/banner_hero.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-badge">Traditional & Authentic</span>
            <h1 className="hero-title">MANA PALLETURU <br /> FOODS</h1>
            <p className="hero-description">
              Authentic Andhra pickles, slow-cooked the traditional way. 100% natural ingredients, hand-ground spices, zero preservatives.
            </p>
            <div className="hero-btn-group">
              <button 
                className="hero-btn"
                onClick={() => document.getElementById('pickles').scrollIntoView({ behavior: 'smooth' })}
              >
                Shop Now
              </button>
              <button 
                className="hero-btn-ghost"
                onClick={() => document.getElementById('combos').scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Categories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Best Seller Combos Section */}
      <section id="combos" className="combos-section">
        <div className="section-header">
          <span className="section-tagline">Signature Selections</span>
          <h2 className="section-title">Best Seller Combo Packs</h2>
          <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Our top-voted, premium assortment packs. Perfect for gifting or feasting (1kg total weight each).
          </p>
        </div>

        <div className="combos-grid">
          {combos.map((combo) => (
            <div 
              key={combo.id} 
              className="combo-card-link"
            >
              <div className="combo-card">
                <span className="best-seller-badge">Best Seller</span>
                <div className="combo-img-wrapper">
                  <Image 
                    src={combo.image_url} 
                    alt={combo.name} 
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                </div>
                <div className="combo-info">
                  <h3 className="combo-name">{combo.name}</h3>
                  
                  <div className="combo-contents-box" style={{ marginBottom: '1.5rem' }}>
                    <div className="combo-contents-list">
                      <div className="combo-contents-title">Items:</div>
                      <ul className="combo-contents-items">
                        {Array.isArray(combo.contents) && combo.contents.map((item, idx) => (
                          <li key={idx}>• {item.name} ({item.weight})</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="combo-action-row">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 650 }}>1kg total</span>
                      <span className="combo-price">₹{combo.price}</span>
                    </div>
                    
                    <button 
                      className="add-to-cart-btn"
                      onClick={(e) => handleAddComboToCart(combo, e)}
                    >
                      <ShoppingCart size={18} /> Add Combo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Individual Pickle Products Section */}
      <section id="pickles" className="pickles-section">
        <div className="section-header">
          <span className="section-tagline">Crafted Individual Jars</span>
          <h2 className="section-title">Our Premium Pickles</h2>
          <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Choose your favorites by weight, available in 500gms and 1kg options.
          </p>
        </div>

        <div className="pickles-grid">
          {products.map((product) => {
            const weight = selectedWeights[product.id] || '500gms';
            const price = weight === '500gms' ? product.price_500gms : product.price_1kg;
            return (
              <div key={product.id} className="pickle-card">
                <div className="pickle-img-wrapper">
                  <Image 
                    src={product.image_url} 
                    alt={product.name} 
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="pickle-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 className="pickle-name" style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                    <Link href={`/product/${product.id}`} className="hover-underline">{product.name}</Link>
                  </h3>
                  
                  {/* Weight Selector */}
                  <div className="weight-selector" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <button 
                      type="button"
                      onClick={() => handleWeightChange(product.id, '500gms')}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.25rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: '1.5px solid',
                        borderColor: weight === '500gms' ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: weight === '500gms' ? 'var(--color-primary-light)' : 'transparent',
                        color: weight === '500gms' ? 'var(--color-primary-dark)' : 'var(--color-text-light)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                    >
                      500g • ₹{product.price_500gms}
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleWeightChange(product.id, '1kg')}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.25rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: '1.5px solid',
                        borderColor: weight === '1kg' ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: weight === '1kg' ? 'var(--color-primary-light)' : 'transparent',
                        color: weight === '1kg' ? 'var(--color-primary-dark)' : 'var(--color-text-light)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                    >
                      1kg • ₹{product.price_1kg}
                    </button>
                  </div>
                  
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => handleAddProductToCart(product, e)}
                    style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', height: '42px', minHeight: '42px', fontSize: '0.9rem', marginTop: 'auto' }}
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header" style={{ marginBottom: '3rem' }}>
            <span className="section-tagline">Our Heritage</span>
            <h2 className="section-title">About Us</h2>
          </div>
          <div className="about-content-wrapper">
            <div className="about-text-column">
              <p>
                At Mana Palleturu Foods, we are dedicated to preserving and sharing the rich, authentic culinary heritage of rural Andhra home-cooking. Our premium non-vegetarian pickles are prepared using age-old family recipes passed down through generations.
              </p>
              <p>
                Every jar is slow-cooked in small, hygienic batches under strict quality supervision in our West Godavari kitchen. We source only the finest premium cut meats, fresh hand-ground spices, and pure cold-pressed groundnut oil. We commit to 100% natural ingredients, containing absolutely no artificial colors, chemical preservatives, or synthetic additives. Taste the warmth and love of a traditional Andhra home.
              </p>
            </div>
            <div className="about-image-column">
              <Image 
                src="/images/products/chicken_pickle.png" 
                alt="Traditional Andhra Spice and Pickles" 
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 992px) 100vw, 500px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="reviews-section">
        <div className="section-header">
          <span className="section-tagline">Testimonials</span>
          <h2 className="section-title">What Our Customers Say</h2>
          <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Hear from pickle enthusiasts who love our authentic Andhra village recipes.
          </p>
        </div>
        
        <div className="reviews-grid">
          <div className="review-card">
            <div className="review-stars">★ ★ ★ ★ ★</div>
            <p className="review-text">"Tastes just like my grandmother used to make. The chicken boneless pickle was perfect, tender meat chunks glazed in robust spices."</p>
            <div className="review-footer">
              <span className="review-author">Lakshmi P.</span>
              <span className="review-city">Vijayawada</span>
            </div>
          </div>
          
          <div className="review-card">
            <div className="review-stars">★ ★ ★ ★ ★</div>
            <p className="review-text">"Ordering through WhatsApp was surprisingly simple and fast. The Non-Veg Combo 1 has a great variety. Will definitely order again!"</p>
            <div className="review-footer">
              <span className="review-author">Ravi Kumar</span>
              <span className="review-city">Hyderabad</span>
            </div>
          </div>
          
          <div className="review-card">
            <div className="review-stars">★ ★ ★ ★ ★</div>
            <p className="review-text">"The mutton boneless pickle is outstanding. Very clean preparation, not too greasy, and the meat is super soft and well-marinated."</p>
            <div className="review-footer">
              <span className="review-author">Sridevi N.</span>
              <span className="review-city">Bengaluru</span>
            </div>
          </div>
          
          <div className="review-card">
            <div className="review-stars">★ ★ ★ ★ ★</div>
            <p className="review-text">"Pure authentic Godavari taste! No chemical smell or synthetic vinegar. Glistening in fresh groundnut oil just like home-made pickles."</p>
            <div className="review-footer">
              <span className="review-author">Venkat Rao</span>
              <span className="review-city">Visakhapatnam</span>
            </div>
          </div>

          <div className="review-card">
            <div className="review-stars">★ ★ ★ ★ ★</div>
            <p className="review-text">"Absolutely love the Fish Pickle. Apollo fish cuts are cooked to crispy perfection and spice-coated beautifully. Delivery was prompt."</p>
            <div className="review-footer">
              <span className="review-author">Anitha K.</span>
              <span className="review-city">Chennai</span>
            </div>
          </div>
        </div>
      </section>

      {/* How to Order Section */}
      <section id="how-to-order" className="how-to-order-section">
        <div className="section-header" style={{ marginBottom: '3.5rem' }}>
          <span className="section-tagline">Seamless Checkout</span>
          <h2 className="section-title">How To Order</h2>
          <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Ordering our premium pickles is a simple conversational process on WhatsApp.
          </p>
        </div>
        
        <div className="how-to-order-timeline">
          <div className="timeline-line"></div>
          
          <div className="timeline-step">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Step 1: Choose Pickles</h3>
              <p>Browse our rich selection of premium non-veg pickles and combo packs.</p>
            </div>
          </div>
          
          <div className="timeline-step">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Step 2: Select Package Size</h3>
              <p>Choose package weights (500g or 1kg) and add items directly to your cart.</p>
            </div>
          </div>
          
          <div className="timeline-step">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Step 3: Enter Delivery Details</h3>
              <p>Fill in your delivery address and choose your shipping state in the checkout wizard.</p>
            </div>
          </div>
          
          <div className="timeline-step">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Step 4: Confirm via WhatsApp</h3>
              <p>Confirm and send your pre-filled order details via WhatsApp to receive payment instructions.</p>
            </div>
          </div>
          
          <div className="timeline-step">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Step 5: Doorstep Delivery</h3>
              <p>Your fresh batch will be slow-cooked, securely sealed, and dispatched right to your door!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
