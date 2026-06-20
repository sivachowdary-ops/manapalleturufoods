'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { getProducts, getCombos } from '@/lib/db';
import { ShoppingCart, Award, ShieldCheck, Flame, ChevronRight, Search, ShoppingBag, MessageCircle, Truck } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addedItemMessage, setAddedItemMessage] = useState(null);

  useEffect(() => {
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
  }, []);

  const handleAddComboToCart = (combo, e) => {
    // Prevent the parent card Link redirection when clicking the Add button
    e.preventDefault();
    e.stopPropagation();
    addToCart(combo, '1kg (Combo Pack)', combo.price, 1);
    triggerSuccessNotification(`${combo.name} Added to Cart!`);
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
            <h1 className="hero-title">MANA PALLETURU<br />FOODS</h1>
            <p className="hero-description">
              Rich, Slow-Cooked Premium Non-Veg Pickles. Experience the culinary heritage of Godavari. Made with 100% natural ingredients, premium cut meats, freshly hand-ground spices, and pure cold-pressed oil. Slow-cooked in small batches with zero synthetic preservatives.
            </p>
            <div className="hero-btn-group">
              <button 
                className="hero-btn"
                onClick={() => document.getElementById('combos').scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Combos
              </button>
              <button 
                className="hero-btn-ghost"
                onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Pickles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Value Props Section */}
      <section style={{ padding: '3rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }} className="pickles-grid">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'var(--color-accent-light)', padding: '0.75rem', borderRadius: '12px', color: 'var(--color-primary)' }}>
              <Award size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>Slow-Cooked Heritage</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', lineHeight: 1.5 }}>Made using age-old Andhra clay-pot recipes passed down through generations.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'var(--color-accent-light)', padding: '0.75rem', borderRadius: '12px', color: 'var(--color-primary)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>100% Preservative Free</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', lineHeight: 1.5 }}>We do not use any vinegar, chemical additives, artificial colors or preservatives.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'var(--color-accent-light)', padding: '0.75rem', borderRadius: '12px', color: 'var(--color-primary)' }}>
              <Flame size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>Cold-Pressed Oils</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', lineHeight: 1.5 }}>Preserved naturally in pure cold-pressed groundnut oil and fresh spices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Best Seller Combos Section (Homepage Centerpiece) */}
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
            <Link 
              key={combo.id} 
              href={`/product/${combo.id}`} 
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
                  <p className="combo-desc">{combo.description}</p>
                  
                  <div className="combo-contents-box" style={{ marginBottom: '1.5rem' }}>
                    <div className="combo-contents-list">
                      <div className="combo-contents-title">Assortment Breakdown:</div>
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
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Individual Pickle Products Section */}
      <section id="pickles" className="pickles-section">
        <div className="section-header">
          <span className="section-tagline">Crafted Individual Jars</span>
          <h2 className="section-title">Our Premium Pickles</h2>
          <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Choose your favorites by weight, available in 500gms and 1kg options.
          </p>
        </div>

        <div className="pickles-grid">
          {products.map((product) => (
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
              <div className="pickle-info">
                <h3 className="pickle-name">{product.name}</h3>
                <p className="pickle-desc">{product.description}</p>
                
                <div className="pickle-action-row">
                  <div>
                    <div className="pickle-price-label">From</div>
                    <span className="pickle-price">₹{product.price_500gms}</span>
                  </div>
                  
                  <Link 
                    href={`/product/${product.id}`}
                    className="add-to-cart-btn"
                    style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', height: '42px', minHeight: '42px' }}
                  >
                    Select Option <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
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
        <div className="section-header">
          <span className="section-tagline">Seamless Checkout</span>
          <h2 className="section-title">How To Order</h2>
          <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Ordering our premium pickles is a simple conversational process on WhatsApp.
          </p>
        </div>
        
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num-badge">1</div>
            <div className="step-icon-box">
              <Search size={32} />
            </div>
            <h3 className="step-title">Browse & Select</h3>
            <p className="step-desc">Choose your favorite individual pickles or premium combo packs and add them to your cart.</p>
          </div>
          
          <div className="step-card">
            <div className="step-num-badge">2</div>
            <div className="step-icon-box">
              <ShoppingBag size={32} />
            </div>
            <h3 className="step-title">Review Your Cart</h3>
            <p className="step-desc">Open the cart page, select package weights (500g or 1kg), quantities, and enter your delivery details.</p>
          </div>
          
          <div className="step-card">
            <div className="step-num-badge">3</div>
            <div className="step-icon-box">
              <MessageCircle size={32} />
            </div>
            <h3 className="step-title">WhatsApp Checkout</h3>
            <p className="step-desc">Click checkout to immediately open a pre-formatted WhatsApp chat with your order details pre-filled.</p>
          </div>
          
          <div className="step-card">
            <div className="step-num-badge">4</div>
            <div className="step-icon-box">
              <Truck size={32} />
            </div>
            <h3 className="step-title">Confirm & Enjoy</h3>
            <p className="step-desc">We will confirm shipping costs in the chat and dispatch your authentic pickles right to your doorstep.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
