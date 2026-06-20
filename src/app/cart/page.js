'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/db';
import { Trash2, MessageCircle, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function CartPage() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    cartCount, 
    cartSubtotal,
    cartWeightGms,
    isLoaded 
  } = useCart();

  const router = useRouter();

  // Wizard state: 1 = Review Cart, 2 = Delivery Details, 3 = Order Summary, 4 = WhatsApp Redirect
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('918143995777');
  const [whatsappUrl, setWhatsappUrl] = useState('');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerStreet, setCustomerStreet] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');
  const [errors, setErrors] = useState({});

  // Load configuration and details on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load WhatsApp number
      const storedWhatsapp = localStorage.getItem('mp_settings_whatsapp');
      if (storedWhatsapp && storedWhatsapp.length === 10) {
        setWhatsappNumber(`91${storedWhatsapp}`);
      } else {
        const envNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918143995777';
        if (envNum.length === 10) {
          setWhatsappNumber(`91${envNum}`);
        } else {
          setWhatsappNumber(envNum.replace('+', ''));
        }
      }

      // Load form details
      setCustomerName(localStorage.getItem('mp_checkout_name') || '');
      setCustomerPhone(localStorage.getItem('mp_checkout_phone') || '');
      setCustomerStreet(localStorage.getItem('mp_checkout_street') || '');
      setCustomerCity(localStorage.getItem('mp_checkout_city') || '');
      setCustomerState(localStorage.getItem('mp_checkout_state') || '');
      setCustomerPincode(localStorage.getItem('mp_checkout_pincode') || '');
    }
  }, []);

  // Save form details to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mp_checkout_name', customerName);
      localStorage.setItem('mp_checkout_phone', customerPhone);
      localStorage.setItem('mp_checkout_street', customerStreet);
      localStorage.setItem('mp_checkout_city', customerCity);
      localStorage.setItem('mp_checkout_state', customerState);
      localStorage.setItem('mp_checkout_pincode', customerPincode);
    }
  }, [customerName, customerPhone, customerStreet, customerCity, customerState, customerPincode]);

  // Form details save/load is already handled by local storage hooks below

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--color-accent-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Retrieving your shopping cart...</p>
      </div>
    );
  }

  // Field validation helper
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (field === 'name') {
      if (!value.trim()) newErrors.name = 'Full name is required';
      else delete newErrors.name;
    }
    if (field === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (!value.trim()) newErrors.phone = 'Phone number is required';
      else if (digits.length < 10) newErrors.phone = 'Must be at least 10 digits';
      else delete newErrors.phone;
    }
    if (field === 'street') {
      if (!value.trim()) newErrors.street = 'Street address is required';
      else delete newErrors.street;
    }
    if (field === 'city') {
      if (!value.trim()) newErrors.city = 'City is required';
      else delete newErrors.city;
    }
    if (field === 'state') {
      if (!value.trim()) newErrors.state = 'State is required';
      else delete newErrors.state;
    }
    if (field === 'pincode') {
      if (!value.trim()) newErrors.pincode = 'Pincode is required';
      else if (!/^[0-9]{6}$/.test(value.trim())) newErrors.pincode = 'Must be exactly 6 digits';
      else delete newErrors.pincode;
    }
    setErrors(newErrors);
  };

  // Form validity check
  const isFormValid = () => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    return (
      customerName.trim().length > 0 &&
      cleanPhone.length >= 10 &&
      customerStreet.trim().length > 0 &&
      customerCity.trim().length > 0 &&
      customerState.trim().length > 0 &&
      /^[0-9]{6}$/.test(customerPincode.trim())
    );
  };

  const handleProceedToStep3 = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setStep(3);
  };

  const handleConfirmOrder = () => {
    if (!isFormValid()) return;

    setSubmitting(true);
    try {
      // 1. Generate dynamic WhatsApp text message
      let cartLines = cart.map(item => 
        `• ${item.name} - ${item.selectedWeight} x ${item.quantity} - ₹${item.price * item.quantity}`
      ).join('\n');

      const whatsappText = `Hi Mana Palleturu Foods! I'd like to place an order:

${cartLines}

Total: ₹${cartSubtotal}
Total Weight: ${(cartWeightGms / 1000).toFixed(2)} kg

Delivery Details:
Name: ${customerName.trim()}
Phone: ${customerPhone.trim()}
Address: ${customerStreet.trim()}, ${customerCity.trim()}, ${customerState.trim()} - ${customerPincode.trim()}

Note: Shipping charges are extra and will be confirmed separately via WhatsApp.

Please confirm my order. Thank you!`;

      const encodedText = encodeURIComponent(whatsappText);
      const url = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
      
      // Save URL to state
      setWhatsappUrl(url);

      // 2. Prepare order payload and log order to database in background
      const cleanPhoneDigits = customerPhone.replace(/\D/g, '').slice(-10);
      const orderPayload = {
        customer_name: `${customerName.trim()} - Address: ${customerStreet.trim()}, ${customerCity.trim()}, ${customerPincode.trim()}`,
        customer_phone: cleanPhoneDigits,
        customer_state: customerState.trim(),
        cart_contents: cart.map(item => ({
          id: item.id,
          name: item.name,
          weight: item.selectedWeight,
          quantity: item.quantity,
          price: item.price
        })),
        total_weight_gms: cartWeightGms,
        subtotal: cartSubtotal,
        status: 'Pending'
      };

      createOrder(orderPayload).catch(err => {
        console.error("Background order save failed:", err);
      });

      // 3. Immediately trigger user-initiated redirection to avoid popup block
      window.location.href = url;

      // 4. Clear local cart context
      clearCart();

      // 5. Update to Step 4 success page
      setStep(4);
    } catch (e) {
      console.error("Order processing error:", e);
      // Fallback redirection
      const fallbackText = `Hi Mana Palleturu Foods! I'd like to place an order. Name: ${customerName.trim()}`;
      const fallbackUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fallbackText)}`;
      setWhatsappUrl(fallbackUrl);
      window.location.href = fallbackUrl;
      clearCart();
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  // Render multi-step progress bar
  const renderProgressBar = () => {
    const steps = [
      { num: 1, label: 'Review Cart' },
      { num: 2, label: 'Delivery Details' },
      { num: 3, label: 'Order Summary' },
      { num: 4, label: 'WhatsApp Redirect' }
    ];
    const fillPercent = ((step - 1) / (steps.length - 1)) * 100;

    return (
      <div className="wizard-steps-bar">
        <div className="wizard-step-line-fill" style={{ width: `${fillPercent}%` }}></div>
        {steps.map((s) => (
          <div 
            key={s.num} 
            className={`wizard-step-node ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
          >
            <div className="wizard-step-circle">
              {step > s.num ? '✓' : s.num}
            </div>
            <div className="wizard-step-label">{s.label}</div>
          </div>
        ))}
      </div>
    );
  };

  // ----------------------------------------------------
  // STEP 4 VIEW: SUCCESS REDIRECT VIEW
  // ----------------------------------------------------
  if (step === 4) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', padding: '5rem 0', minHeight: '75vh' }}>
        <div className="success-checkout-view">
          <div className="success-icon-container">
            <CheckCircle size={48} />
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            Order Sent!
          </h1>
          <p style={{ color: 'var(--color-text)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your order details have been compiled and sent to WhatsApp. If you need to re-open the WhatsApp chat or if the redirect was blocked, please click the button below.
          </p>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '350px' }}>
            <a 
              href={whatsappUrl}
              className="wizard-primary-btn"
              style={{ textDecoration: 'none', backgroundColor: '#25D366' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.451L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.38 2.016 13.908.993 12.01.993c-5.462 0-9.902 4.37-9.906 9.8-.001 2.03.55 4.015 1.597 5.811l-1.01 3.687 3.774-.973zm11.233-6.16c-.3-.15-1.77-.875-2.04-.972-.27-.099-.465-.15-.66.15-.195.3-.75.972-.92 1.17-.17.195-.34.21-.64.06-3.002-1.498-4.22-2.583-5.86-5.4-.435-.747.435-.69.87-1.425.135-.225.06-.42-.03-.57-.09-.15-.75-1.8-1.03-2.475-.27-.655-.55-.567-.75-.577-.19-.01-.41-.01-.63-.01-.22 0-.58.08-.885.42-.305.34-1.16 1.134-1.16 2.766 0 1.63 1.19 3.199 1.35 3.42.16.22 2.333 3.535 5.65 4.96.79.34 1.405.542 1.885.694.793.25 1.517.215 2.086.13.635-.095 1.77-.72 2.02-1.38.25-.66.25-1.23.175-1.38-.075-.15-.27-.24-.57-.39z"/>
              </svg>
              Open WhatsApp Chat
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // EMPTY CART VIEW (for Steps 1, 2, 3)
  // ----------------------------------------------------
  if (cart.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', padding: '5rem 0', minHeight: '75vh' }}>
        <div className="empty-cart-view">
          <Trash2 size={64} style={{ color: 'var(--color-primary)', opacity: 0.3 }} />
          <h2 className="empty-cart-title">Your Cart is Empty</h2>
          <p className="empty-cart-text">Looks like you haven't added any of our delicious pickles to your cart yet.</p>
          <Link href="/" className="hero-btn">
            Browse Our Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', padding: '4rem 0', minHeight: '80vh' }}>
      <div className="checkout-wizard-container">
        
        {/* Progress Bar */}
        {renderProgressBar()}

        {/* ----------------------------------------------------
            STEP 1: REVIEW YOUR CART
            ---------------------------------------------------- */}
        {step === 1 && (
          <div>
            <h1 className="cart-title">Step 1 of 4: Review Your Cart</h1>
            <div className="cart-layout" style={{ gridTemplateColumns: '1fr' }}>
              <div className="cart-items-wrapper">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedWeight}`} className="cart-item">
                    <div className="cart-item-img">
                      <Image 
                        src={item.image_url} 
                        alt={item.name} 
                        fill 
                        style={{ objectFit: 'cover' }}
                        sizes="80px"
                      />
                    </div>
                    
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-meta">
                        Weight: <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{item.selectedWeight}</span>
                      </p>
                      <p className="cart-item-meta">
                        Unit Price: ₹{item.price}
                      </p>
                    </div>
                    
                    <div className="cart-item-controls">
                      <div className="quantity-control" style={{ height: '36px' }}>
                        <button 
                          className="qty-btn" 
                          onClick={() => updateQuantity(item.id, item.selectedWeight, item.quantity - 1)}
                          style={{ padding: '0 0.5rem' }}
                        >
                          -
                        </button>
                        <span className="qty-value" style={{ width: '25px' }}>{item.quantity}</span>
                        <button 
                          className="qty-btn" 
                          onClick={() => updateQuantity(item.id, item.selectedWeight, item.quantity + 1)}
                          style={{ padding: '0 0.5rem' }}
                        >
                          +
                        </button>
                      </div>
                      
                      <span className="cart-item-price">
                        ₹{item.price * item.quantity}
                      </span>
                      
                      <button 
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id, item.selectedWeight)}
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Subtotal & Summary Stats */}
                <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--color-text-light)' }}>Total Items:</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{cartCount} jar(s)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--color-text-light)' }}>Total Weight:</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{(cartWeightGms / 1000).toFixed(2)} kg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', fontSize: '1.2rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--color-primary-dark)' }}>Subtotal:</span>
                    <span style={{ color: 'var(--color-primary-dark)' }}>₹{cartSubtotal}</span>
                  </div>
                </div>

                <div className="wizard-actions-row">
                  <Link href="/" className="wizard-secondary-btn" style={{ textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Continue Shopping
                  </Link>
                  <button 
                    onClick={() => setStep(2)}
                    className="wizard-primary-btn"
                  >
                    Proceed to Delivery Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STEP 2: DELIVERY DETAILS
            ---------------------------------------------------- */}
        {step === 2 && (
          <div>
            <h1 className="cart-title">Step 2 of 4: Delivery Details</h1>
            
            {/* Context Summary Bar */}
            <div className="compact-summary-card">
              <span>🛒 <strong>Items:</strong> {cartCount} Jars ({(cartWeightGms / 1000).toFixed(2)} kg)</span>
              <span>Subtotal: <strong>₹{cartSubtotal}</strong></span>
            </div>

            <form onSubmit={handleProceedToStep3} className="single-column-form">
              <div className="form-group">
                <label htmlFor="fullName">Your Full Name *</label>
                <input 
                  type="text" 
                  id="fullName" 
                  className={`form-input ${errors.name ? 'invalid' : ''}`}
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    validateField('name', e.target.value);
                  }}
                  onBlur={() => validateField('name', customerName)}
                  required
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone / WhatsApp Number *</label>
                <input 
                  type="tel" 
                  id="phoneNumber" 
                  className={`form-input ${errors.phone ? 'invalid' : ''}`}
                  placeholder="e.g. +91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    validateField('phone', e.target.value);
                  }}
                  onBlur={() => validateField('phone', customerPhone)}
                  maxLength={16}
                  required
                />
                <span className="form-hint">Used to contact you on WhatsApp for shipping and order confirmation.</span>
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="houseStreet">House No. / Flat, Building, Street *</label>
                <input 
                  type="text" 
                  id="houseStreet" 
                  className={`form-input ${errors.street ? 'invalid' : ''}`}
                  placeholder="e.g. Flat 104, Sri Sai Residency, Road No. 3"
                  value={customerStreet}
                  onChange={(e) => {
                    setCustomerStreet(e.target.value);
                    validateField('street', e.target.value);
                  }}
                  onBlur={() => validateField('street', customerStreet)}
                  required
                />
                {errors.street && <span className="form-error">{errors.street}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input 
                  type="text" 
                  id="city" 
                  className={`form-input ${errors.city ? 'invalid' : ''}`}
                  placeholder="e.g. Hyderabad"
                  value={customerCity}
                  onChange={(e) => {
                    setCustomerCity(e.target.value);
                    validateField('city', e.target.value);
                  }}
                  onBlur={() => validateField('city', customerCity)}
                  required
                />
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input 
                  type="text" 
                  id="state" 
                  className={`form-input ${errors.state ? 'invalid' : ''}`}
                  placeholder="e.g. Telangana"
                  value={customerState}
                  onChange={(e) => {
                    setCustomerState(e.target.value);
                    validateField('state', e.target.value);
                  }}
                  onBlur={() => validateField('state', customerState)}
                  required
                />
                <span className="form-hint">Used for shipping cost calculation.</span>
                {errors.state && <span className="form-error">{errors.state}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode *</label>
                <input 
                  type="text" 
                  id="pincode" 
                  className={`form-input ${errors.pincode ? 'invalid' : ''}`}
                  placeholder="e.g. 500084 (6 digits)"
                  value={customerPincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // numbers only
                    setCustomerPincode(val);
                    validateField('pincode', val);
                  }}
                  onBlur={() => validateField('pincode', customerPincode)}
                  maxLength={6}
                  required
                />
                {errors.pincode && <span className="form-error">{errors.pincode}</span>}
              </div>

              <div className="wizard-actions-row">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="wizard-secondary-btn"
                >
                  <ArrowLeft size={16} /> Back to Cart
                </button>
                <button 
                  type="submit" 
                  className="wizard-primary-btn"
                  disabled={!isFormValid()}
                >
                  Review Order <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
            STEP 3: ORDER SUMMARY
            ---------------------------------------------------- */}
        {step === 3 && (
          <div>
            <h1 className="cart-title">Step 3 of 4: Order Summary</h1>

            <div className="summary-details-box">
              
              {/* Items Section */}
              <div className="summary-details-section">
                <h3>Items in Your Order</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cart.map((item) => (
                    <div 
                      key={`${item.id}-${item.selectedWeight}`} 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}
                    >
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                          <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="40px" />
                        </div>
                        <div>
                          <strong style={{ color: 'var(--color-text)' }}>{item.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                            Weight: {item.selectedWeight} | Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Section */}
              <div className="summary-details-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span>Total Weight:</span>
                  <span style={{ fontWeight: 650 }}>{(cartWeightGms / 1000).toFixed(2)} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  <span>Shipping Cost:</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Confirming via WhatsApp</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-primary)', paddingTop: '0.75rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--color-primary-dark)' }}>Subtotal:</span>
                  <span style={{ color: 'var(--color-primary-dark)' }}>₹{cartSubtotal}</span>
                </div>
                <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                  🌿 Note: Shipping charges are calculated based on your location and will be added to the final quote in the WhatsApp chat.
                </p>
              </div>

              {/* Delivery Details Section */}
              <div className="summary-details-section">
                <h3>Delivery Destination</h3>
                <div className="summary-info-grid">
                  <div className="summary-info-item">
                    <strong>Recipient Name:</strong>
                    <span>{customerName}</span>
                  </div>
                  <div className="summary-info-item">
                    <strong>WhatsApp Phone:</strong>
                    <span>{customerPhone}</span>
                  </div>
                  <div className="summary-info-item">
                    <strong>Delivery Address:</strong>
                    <span>{customerStreet}, {customerCity}, {customerState} - {customerPincode}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => setStep(2)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Edit Delivery Details
                </button>
              </div>
            </div>

            <div className="wizard-actions-row">
              <button 
                onClick={() => setStep(2)}
                className="wizard-secondary-btn"
                disabled={submitting}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                onClick={handleConfirmOrder}
                className="wizard-primary-btn"
                disabled={submitting}
                style={{ backgroundColor: '#25D366' }} // WhatsApp Green
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.451L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.38 2.016 13.908.993 12.01.993c-5.462 0-9.902 4.37-9.906 9.8-.001 2.03.55 4.015 1.597 5.811l-1.01 3.687 3.774-.973zm11.233-6.16c-.3-.15-1.77-.875-2.04-.972-.27-.099-.465-.15-.66.15-.195.3-.75.972-.92 1.17-.17.195-.34.21-.64.06-3.002-1.498-4.22-2.583-5.86-5.4-.435-.747.435-.69.87-1.425.135-.225.06-.42-.03-.57-.09-.15-.75-1.8-1.03-2.475-.27-.655-.55-.567-.75-.577-.19-.01-.41-.01-.63-.01-.22 0-.58.08-.885.42-.305.34-1.16 1.134-1.16 2.766 0 1.63 1.19 3.199 1.35 3.42.16.22 2.333 3.535 5.65 4.96.79.34 1.405.542 1.885.694.793.25 1.517.215 2.086.13.635-.095 1.77-.72 2.02-1.38.25-.66.25-1.23.175-1.38-.075-.15-.27-.24-.57-.39z"/>
                </svg>
                {submitting ? 'Processing Order...' : 'Confirm & Send Order via WhatsApp'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
