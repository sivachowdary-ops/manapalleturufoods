'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  getProducts, getCombos, getOrders, updateOrderStatus,
  saveProduct, deleteProduct, saveCombo, deleteCombo, getDbMode
} from '@/lib/db';
import { 
  TrendingUp, ShoppingBag, DollarSign, Clock, Package, 
  Settings, LogOut, Store, Plus, Edit2, Trash2, Eye, 
  Check, X, ToggleLeft, ToggleRight, UserCheck, AlertTriangle,
  Globe, KeyRound, Smartphone, MapPin, Mail, Menu
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'products', 'orders', 'settings'
  const [dbMode, setDbMode] = useState('MockStorage');
  const [authorized, setAuthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  // Catalog and Order State
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    pendingOrders: 0
  });

  // Edit / Add Forms state
  const [editingItem, setEditingItem] = useState(null); // { type: 'product'|'combo', data: item }
  const [isAdding, setIsAdding] = useState(null); // 'product' or 'combo'
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Settings State
  const [whatsappNumber, setWhatsappNumber] = useState('8143995777');
  const [instagramLink, setInstagramLink] = useState('https://instagram.com/manapalleturufoods');
  const [whatsappError, setWhatsappError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', msg: '' });
  const [newEmail, setNewEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState({ type: '', msg: '' });

  // Verify auth session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('mp_admin_session');
      const email = sessionStorage.getItem('mp_admin_email');
      if (session !== 'active') {
        router.push('/admin/login');
      } else {
        setAuthorized(true);
        setAdminEmail(email || 'manager@manapalleturufoods.com');
      }
    }
    setDbMode(getDbMode());
  }, [router]);

  // Load all dashboard data
  const loadData = async () => {
    setLoading(true);
    try {
      const prodData = await getProducts();
      const comboData = await getCombos();
      const orderData = await getOrders();

      setProducts(prodData);
      setCombos(comboData);
      setOrders(orderData);

      // Calculate Stats
      const confirmedOrders = orderData.filter(o => o.status === 'Confirmed' || o.status === 'Shipped');
      const revenue = confirmedOrders.reduce((sum, o) => sum + o.subtotal, 0);
      const totalOrdersCount = orderData.length;
      const pendingCount = orderData.filter(o => o.status === 'Pending').length;
      const avgValue = totalOrdersCount > 0 ? Math.round(revenue / totalOrdersCount) : 0;

      setStats({
        totalRevenue: revenue,
        totalOrders: totalOrdersCount,
        avgOrderValue: avgValue,
        pendingOrders: pendingCount
      });

      // Load Settings
      if (typeof window !== 'undefined') {
        const storedWhatsApp = localStorage.getItem('mp_settings_whatsapp');
        if (storedWhatsApp) {
          if (storedWhatsApp.length === 12 && storedWhatsApp.startsWith('91')) {
            setWhatsappNumber(storedWhatsApp.substring(2));
          } else {
            setWhatsappNumber(storedWhatsApp);
          }
        } else {
          setWhatsappNumber('8143995777');
        }
        
        const storedInstagram = localStorage.getItem('mp_settings_instagram');
        if (storedInstagram) setInstagramLink(storedInstagram);
      }
    } catch (e) {
      console.error("Error loading dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mp_admin_session');
      sessionStorage.removeItem('mp_admin_email');
      router.push('/admin/login');
    }
  };

  // Order status modification
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadData(); // Reload statistics and lists
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  // Stock status toggle
  const handleStockToggle = async (item, type) => {
    try {
      if (type === 'product') {
        await saveProduct({ ...item, in_stock: !item.in_stock });
      } else {
        await saveCombo({ ...item, in_stock: !item.in_stock });
      }
      loadData();
    } catch (e) {
      console.error("Failed to toggle stock status", e);
    }
  };

  // Best seller toggle
  const handleBestSellerToggle = async (combo) => {
    try {
      await saveCombo({ ...combo, is_best_seller: !combo.is_best_seller });
      loadData();
    } catch (e) {
      console.error("Failed to toggle best seller status", e);
    }
  };

  // Delete handlers
  const handleDeleteItem = async (id, type) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        if (type === 'product') {
          await deleteProduct(id);
        } else {
          await deleteCombo(id);
        }
        loadData();
      } catch (e) {
        console.error("Deletion failed", e);
      }
    }
  };

  // Edit / Add Form Handlers
  const startEdit = (item, type) => {
    setEditingItem({ type, id: item.id });
    setIsAdding(null);
    setFormData(item);
    setFormErrors({});
  };

  const startAdd = (type) => {
    setIsAdding(type);
    setEditingItem(null);
    setFormErrors({});
    if (type === 'product') {
      setFormData({
        name: '',
        description: '',
        image_url: '/images/products/chicken_pickle.png',
        price_500gms: '',
        price_1kg: '',
        category: 'Pickles',
        in_stock: true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image_url: '/images/products/combo_1.png',
        price: '',
        contents: [
          { name: 'Chicken Pickle', weight: '250gms' },
          { name: 'Chicken Boneless Pickle', weight: '250gms' },
          { name: 'Chicken Kheema Pickle', weight: '250gms' },
          { name: 'Naatu Kodi Pickle', weight: '250gms' }
        ],
        is_best_seller: true,
        in_stock: true
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.image_url?.trim()) errors.image_url = 'Image URL is required';

    if (isAdding === 'product' || editingItem?.type === 'product') {
      if (!formData.price_500gms || Number(formData.price_500gms) <= 0) {
        errors.price_500gms = 'Price for 500g must be a positive number';
      }
      if (!formData.price_1kg || Number(formData.price_1kg) <= 0) {
        errors.price_1kg = 'Price for 1kg must be a positive number';
      }
    } else {
      if (!formData.price || Number(formData.price) <= 0) {
        errors.price = 'Combo price must be a positive number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isAdding === 'product' || editingItem?.type === 'product') {
        const payload = {
          ...formData,
          price_500gms: Number(formData.price_500gms),
          price_1kg: Number(formData.price_1kg)
        };
        await saveProduct(payload);
      } else {
        const payload = {
          ...formData,
          price: Number(formData.price)
        };
        await saveCombo(payload);
      }
      
      setEditingItem(null);
      setIsAdding(null);
      loadData();
    } catch (e) {
      console.error("Save failed", e);
      alert("Error saving data. Please check input parameters.");
    }
  };

  // Combo contents editing
  const handleComboContentChange = (index, field, value) => {
    const updatedContents = [...formData.contents];
    updatedContents[index][field] = value;
    setFormData({ ...formData, contents: updatedContents });
  };

  // Settings Save
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setWhatsappError('');
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(whatsappNumber.trim())) {
      setWhatsappError('WhatsApp Number must be exactly 10 digits.');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('mp_settings_whatsapp', whatsappNumber.trim());
      localStorage.setItem('mp_settings_instagram', instagramLink.trim());
      alert('Settings saved successfully!');
    }
  };

  // Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', msg: '' });

    if (!currentPassword) {
      setPasswordStatus({ type: 'error', msg: 'Please enter your current password.' });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordStatus({ type: 'error', msg: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    try {
      if (dbMode === 'Supabase') {
        // Attempt login/reauth using the current password to verify it is correct
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: currentPassword
        });

        if (reauthError) {
          setPasswordStatus({ type: 'error', msg: 'Current password is incorrect.' });
          return;
        }

        // Reauthentication passed, now update the password
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setPasswordStatus({ type: 'success', msg: 'Password updated successfully in Supabase Auth!' });
      } else {
        // Save in mock storage
        const mockUsers = JSON.parse(localStorage.getItem('mp_mock_users') || '[]');
        const storedMockAdminPass = localStorage.getItem('mp_mock_admin_password') || 'admin';
        
        let isCurrentCorrect = false;
        if (adminEmail === 'admin@manapalleturufoods.com') {
          isCurrentCorrect = currentPassword === storedMockAdminPass;
        } else {
          const mockUser = mockUsers.find(u => u.email === adminEmail);
          if (mockUser) {
            isCurrentCorrect = currentPassword === mockUser.password;
          }
        }

        if (!isCurrentCorrect) {
          setPasswordStatus({ type: 'error', msg: 'Current password is incorrect.' });
          return;
        }

        if (adminEmail === 'admin@manapalleturufoods.com') {
          localStorage.setItem('mp_mock_admin_password', newPassword);
        } else {
          const updatedMockUsers = mockUsers.map(u => {
            if (u.email === adminEmail) {
              return { ...u, password: newPassword };
            }
            return u;
          });
          localStorage.setItem('mp_mock_users', JSON.stringify(updatedMockUsers));
        }

        setPasswordStatus({ type: 'success', msg: 'Password updated successfully in Local Mock Storage!' });
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Failed to update password:", err);
      setPasswordStatus({ type: 'error', msg: err.message || 'Failed to update password.' });
    }
  };

  // Email Update
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailStatus({ type: '', msg: '' });

    if (!newEmail || !newEmail.trim() || newEmail.trim() === adminEmail) {
      setEmailStatus({ type: 'error', msg: 'Please enter a new, different email address.' });
      return;
    }

    try {
      if (dbMode === 'Supabase') {
        const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
        if (error) throw error;
        
        setEmailStatus({ 
          type: 'success', 
          msg: 'Verification links sent! Please check both your current and new email addresses to confirm the change.' 
        });
      } else {
        // Mock Storage update
        const mockUsers = JSON.parse(localStorage.getItem('mp_mock_users') || '[]');
        if (adminEmail === 'admin@manapalleturufoods.com') {
          setEmailStatus({ type: 'error', msg: 'Cannot change default admin email in mock storage mode.' });
          return;
        }

        const idx = mockUsers.findIndex(u => u.email === adminEmail);
        if (idx !== -1) {
          mockUsers[idx].email = newEmail.trim();
          localStorage.setItem('mp_mock_users', JSON.stringify(mockUsers));
          sessionStorage.setItem('mp_admin_email', newEmail.trim());
          setAdminEmail(newEmail.trim());
          setEmailStatus({ type: 'success', msg: 'Email updated successfully in Local Mock Storage!' });
        } else {
          setEmailStatus({ type: 'error', msg: 'User not found in mock storage.' });
        }
      }
      setNewEmail('');
    } catch (err) {
      console.error("Failed to update email:", err);
      setEmailStatus({ type: 'error', msg: err.message || 'Failed to update email.' });
    }
  };

  if (!authorized) return null;

  return (
    <div className="admin-layout">
      {/* 1. Admin Header Navigation with Brand Logo */}
      <header className="admin-navbar">
        <div className="admin-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--color-accent)' }}>
            <Image src="/logo.png" alt="Company Logo" fill style={{ objectFit: 'cover' }} sizes="45px" />
          </div>
          <div>
            Admin Dashboard
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="admin-menu-toggle"
          onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isAdminMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="admin-nav-tabs desktop-only">
          <button 
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setEditingItem(null); setIsAdding(null); }}
          >
            <TrendingUp size={16} /> Dashboard
          </button>
          <button 
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setEditingItem(null); setIsAdding(null); }}
          >
            <Package size={16} /> Products
          </button>
          <button 
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setEditingItem(null); setIsAdding(null); }}
          >
            <ShoppingBag size={16} /> Orders
          </button>
          <button 
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setEditingItem(null); setIsAdding(null); }}
          >
            <Settings size={16} /> Settings
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="admin-actions desktop-only">
          <div className="admin-role-pill">
            <span className="role-dot">M</span>
            <span>Manager</span>
          </div>
          
          <Link href="/" className="admin-view-store-btn" target="_blank">
            <Store size={14} /> View Store
          </Link>

          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`admin-mobile-drawer ${isAdminMenuOpen ? 'open' : ''}`}>
          <div className="admin-mobile-drawer-content">
            <div className="admin-mobile-header">
              <span className="admin-mobile-title">Admin Controls</span>
              <button 
                className="admin-mobile-close"
                onClick={() => setIsAdminMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="admin-mobile-nav">
              <button 
                className={`admin-mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setActiveTab('dashboard'); setIsAdminMenuOpen(false); setEditingItem(null); setIsAdding(null); }}
              >
                <TrendingUp size={18} /> Dashboard
              </button>
              <button 
                className={`admin-mobile-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => { setActiveTab('products'); setIsAdminMenuOpen(false); setEditingItem(null); setIsAdding(null); }}
              >
                <Package size={18} /> Products
              </button>
              <button 
                className={`admin-mobile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => { setActiveTab('orders'); setIsAdminMenuOpen(false); setEditingItem(null); setIsAdding(null); }}
              >
                <ShoppingBag size={18} /> Orders
              </button>
              <button 
                className={`admin-mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('settings'); setIsAdminMenuOpen(false); setEditingItem(null); setIsAdding(null); }}
              >
                <Settings size={18} /> Settings
              </button>
              
              <div className="admin-mobile-divider"></div>
              
              <button 
                className="admin-mobile-nav-item"
                onClick={() => { setActiveTab('dashboard'); setIsAdminMenuOpen(false); setEditingItem(null); setIsAdding(null); }}
              >
                <Store size={18} /> Manage Store
              </button>
              <Link href="/" className="admin-mobile-nav-item" target="_blank" onClick={() => setIsAdminMenuOpen(false)}>
                <Globe size={18} /> View Store
              </Link>
              <button onClick={() => { handleLogout(); setIsAdminMenuOpen(false); }} className="admin-mobile-nav-item logout">
                <LogOut size={18} /> Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* 2. Main Work Area */}
      <main className="admin-main-content">
        
        {dbMode === 'MockStorage' && (
          <div className="db-warning-bar" style={{ marginBottom: '2rem' }}>
            <AlertTriangle size={18} />
            <div>
              Connected to <strong>Local Mock Storage</strong>. Any edits made will be saved to your browser session. Connect to Supabase to enable persistence.
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid var(--color-accent-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Synchronizing database...</p>
          </div>
        ) : (
          <>
            {/* VIEW A: DASHBOARD VIEW (With professional orders log) */}
            {activeTab === 'dashboard' && !editingItem && !isAdding && (
              <div>
                {/* Stats Cards */}
                <div className="admin-metrics-row">
                  <div className="metric-card">
                    <div className="metric-icon-box revenue"><DollarSign size={24} /></div>
                    <div className="metric-info">
                      <span className="metric-title">Total Revenue</span>
                      <span className="metric-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon-box orders"><ShoppingBag size={24} /></div>
                    <div className="metric-info">
                      <span className="metric-title">Total Orders</span>
                      <span className="metric-value">{stats.totalOrders}</span>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon-box avg"><TrendingUp size={24} /></div>
                    <div className="metric-info">
                      <span className="metric-title">Avg Order Value</span>
                      <span className="metric-value">₹{stats.avgOrderValue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon-box pending"><Clock size={24} /></div>
                    <div className="metric-info">
                      <span className="metric-title">Pending Orders</span>
                      <span className="metric-value">{stats.pendingOrders}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders table */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">Recent Customer Orders</h3>
                    <button onClick={loadData} className="admin-view-store-btn" style={{ fontSize: '0.75rem' }}>Refresh List</button>
                  </div>

                  <div className="admin-table-wrapper">
                    {orders.length === 0 ? (
                      <div className="empty-table-msg">No customer orders placed yet.</div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Order Number</th>
                            <th>Customer & Contact</th>
                            <th>State</th>
                            <th>Items Ordered</th>
                            <th>Total Weight</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Change Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 10).map((order) => (
                            <tr key={order.id}>
                              <td style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>ORD-{order.id}</td>
                              <td>
                                <div><strong>{order.customer_name}</strong></div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <Smartphone size={10} /> {order.customer_phone}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <MapPin size={12} style={{ color: 'var(--color-primary)' }} /> {order.customer_state}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                                  {order.cart_contents?.map((cartItem, idx) => (
                                    <div key={idx} style={{ color: 'var(--color-text)' }}>
                                      • <strong>{cartItem.name}</strong> ({cartItem.weight}) x {cartItem.quantity}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td>{(order.total_weight_gms / 1000).toFixed(2)} kg</td>
                              <td style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>₹{order.subtotal}</td>
                              <td>
                                <span className={`status-badge ${order.status.toLowerCase()}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <select 
                                  className="table-action-select"
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW B: PRODUCTS MANAGEMENT VIEW (Professional Grid Layout) */}
            {activeTab === 'products' && !editingItem && !isAdding && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)' }}>Catalog Inventory</h2>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => startAdd('product')} className="admin-save-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '4px' }}>
                      <Plus size={16} /> Add Pickle
                    </button>
                    <button onClick={() => startAdd('combo')} className="admin-save-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--color-accent)' }}>
                      <Plus size={16} /> Add Combo Pack
                    </button>
                  </div>
                </div>

                {/* Combos Inventory Section */}
                <div style={{ marginBottom: '3rem' }}>
                  <h3 className="admin-card-title" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Combo Packs</h3>
                  <div className="admin-products-grid">
                    {combos.map((combo) => (
                      <div key={combo.id} className="admin-product-card">
                        <div className="admin-prod-card-img">
                          <Image src={combo.image_url} alt={combo.name} fill style={{ objectFit: 'cover' }} sizes="120px" />
                        </div>
                        <div className="admin-prod-card-info">
                          <div>
                            <h4 className="admin-prod-card-name">{combo.name}</h4>
                            <p className="admin-prod-card-desc">{combo.description}</p>
                            <div className="admin-prod-card-pills">
                              <span className={`admin-pill ${combo.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                                {combo.in_stock ? 'In Stock' : 'Out of Stock'}
                              </span>
                              {combo.is_best_seller && (
                                <span className="admin-pill best-seller">Best Seller</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: 500, backgroundColor: 'var(--color-bg)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                              <strong>Contents: </strong>
                              {combo.contents?.map(c => `${c.name} (${c.weight})`).join(' + ')}
                            </div>
                          </div>

                          <div className="admin-prod-card-bottom">
                            <span className="admin-prod-card-price">Price: ₹{combo.price}</span>
                            
                            <div className="admin-prod-card-actions">
                              <button 
                                onClick={() => handleStockToggle(combo, 'combo')} 
                                className="admin-edit-link" 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.35rem 0.6rem', border: '1px solid var(--color-border)' }}
                                title="Toggle Stock"
                              >
                                {combo.in_stock ? 'Stock: In' : 'Stock: Out'}
                              </button>
                              <button 
                                onClick={() => handleBestSellerToggle(combo)} 
                                className="admin-edit-link" 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.35rem 0.6rem', border: '1px solid var(--color-border)', color: combo.is_best_seller ? 'var(--color-accent)' : '' }}
                                title="Toggle Best Seller"
                              >
                                Best Seller
                              </button>
                              <button onClick={() => startEdit(combo, 'combo')} className="admin-edit-link" style={{ padding: '0.35rem 0.6rem' }}><Edit2 size={13} /></button>
                              <button onClick={() => handleDeleteItem(combo.id, 'combo')} className="admin-delete-btn" style={{ padding: '0.35rem 0.6rem' }}><Trash2 size={13} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Pickles Section */}
                <div>
                  <h3 className="admin-card-title" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Individual Pickle Jars</h3>
                  <div className="admin-products-grid">
                    {products.map((product) => (
                      <div key={product.id} className="admin-product-card">
                        <div className="admin-prod-card-img">
                          <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="120px" />
                        </div>
                        <div className="admin-prod-card-info">
                          <div>
                            <h4 className="admin-prod-card-name">{product.name}</h4>
                            <p className="admin-prod-card-desc">{product.description}</p>
                            <div className="admin-prod-card-pills">
                              <span className={`admin-pill ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>

                          <div className="admin-prod-card-bottom">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                              <span className="admin-prod-card-price" style={{ fontSize: '0.8rem' }}>500g: ₹{product.price_500gms}</span>
                              <span className="admin-prod-card-price" style={{ fontSize: '0.8rem' }}>1kg: ₹{product.price_1kg}</span>
                            </div>
                            
                            <div className="admin-prod-card-actions">
                              <button 
                                onClick={() => handleStockToggle(product, 'product')} 
                                className="admin-edit-link" 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.35rem 0.6rem', border: '1px solid var(--color-border)' }}
                                title="Toggle Stock"
                              >
                                {product.in_stock ? 'In Stock' : 'Out Stock'}
                              </button>
                              <button onClick={() => startEdit(product, 'product')} className="admin-edit-link" style={{ padding: '0.35rem 0.6rem' }}><Edit2 size={13} /></button>
                              <button onClick={() => handleDeleteItem(product.id, 'product')} className="admin-delete-btn" style={{ padding: '0.35rem 0.6rem' }}><Trash2 size={13} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW C: ORDERS LOG DETAILED VIEW */}
            {activeTab === 'orders' && !editingItem && !isAdding && (
              <div className="admin-card">
                <h2 className="admin-card-title" style={{ marginBottom: '1.5rem' }}>All Customer Checkout Logs</h2>
                <div className="admin-table-wrapper">
                  {orders.length === 0 ? (
                    <div className="empty-table-msg">No checkout logs recorded yet.</div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Customer Details</th>
                          <th>Items Ordered</th>
                          <th>Total Weight</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Status Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>ORD-{order.id}</td>
                            <td>{new Date(order.created_at).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>
                              <div><strong>{order.customer_name}</strong></div>
                              <div>State: {order.customer_state}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Phone: {order.customer_phone}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
                                {order.cart_contents?.map((item, idx) => (
                                  <div key={idx}>
                                    • {item.name} ({item.weight}) x {item.quantity} - ₹{item.price * item.quantity}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td>{(order.total_weight_gms / 1000).toFixed(2)} kg</td>
                            <td style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>₹{order.subtotal}</td>
                            <td>
                              <span className={`status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <select 
                                className="table-action-select"
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* VIEW D: SETTINGS & PASSWORD MANAGEMENT VIEW (Enhanced) */}
            {activeTab === 'settings' && !editingItem && !isAdding && (
              <div className="admin-settings-grid">
                
                {/* Store Redirect Configurations */}
                <div className="admin-card">
                  <h2 className="admin-card-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={20} /> Store Redirect Configuration
                  </h2>
                  <form onSubmit={handleSaveSettings}>
                    <div className="admin-form-group">
                      <label htmlFor="whatsappConfig">Redirect WhatsApp Phone Number</label>
                      <div style={{ display: 'flex' }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: 'var(--color-accent-light)',
                          border: '1px solid var(--color-border)',
                          borderRight: 'none',
                          padding: '0 0.75rem',
                          borderTopLeftRadius: 'var(--radius-sm)',
                          borderBottomLeftRadius: 'var(--radius-sm)',
                          fontWeight: 'bold',
                          color: 'var(--color-primary-dark)',
                          fontSize: '0.9rem'
                        }}>
                          +91
                        </span>
                        <input 
                          type="text" 
                          id="whatsappConfig"
                          className="admin-form-input"
                          style={{
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0
                          }}
                          value={whatsappNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length <= 10) {
                              setWhatsappNumber(val);
                            }
                          }}
                          placeholder="e.g. 8143995777"
                        />
                      </div>
                      {whatsappError && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 650, display: 'block', marginTop: '0.4rem' }}>{whatsappError}</span>}
                      <small style={{ color: 'var(--color-text-light)', display: 'block', marginTop: '0.4rem' }}>
                        Enter the 10-digit mobile number only (without country code or spaces).
                      </small>
                    </div>

                    <div className="admin-form-group">
                      <label htmlFor="instagramConfig">Instagram Account Link</label>
                      <div style={{ position: 'relative' }}>
                        <Globe size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-light)' }} />
                        <input 
                          type="url" 
                          id="instagramConfig"
                          className="admin-form-input"
                          style={{ paddingLeft: '38px' }}
                          value={instagramLink}
                          onChange={(e) => setInstagramLink(e.target.value)}
                          placeholder="https://instagram.com/manapalleturufoods"
                        />
                      </div>
                    </div>

                    <button type="submit" className="admin-save-btn" style={{ borderRadius: '4px', marginTop: '1rem' }}>
                      Save Redirect Settings
                    </button>
                  </form>
                </div>

                {/* Security and Credentials Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Password Management */}
                  <div className="admin-card">
                    <h2 className="admin-card-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <KeyRound size={20} /> Security Settings
                    </h2>
                    
                    {passwordStatus.msg && (
                      <div 
                        style={{ 
                          backgroundColor: passwordStatus.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', 
                          color: passwordStatus.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)', 
                          border: `1px solid ${passwordStatus.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`, 
                          padding: '0.75rem 1rem', 
                          borderRadius: 'var(--radius-sm)', 
                          fontSize: '0.85rem', 
                          marginBottom: '1.25rem', 
                          fontWeight: 500 
                        }}
                      >
                        {passwordStatus.msg}
                      </div>
                    )}

                    <form onSubmit={handleUpdatePassword}>
                      <div className="admin-form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input 
                          type="password" 
                          id="currentPassword"
                          className="admin-form-input"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input 
                          type="password" 
                          id="newPassword"
                          className="admin-form-input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input 
                          type="password" 
                          id="confirmPassword"
                          className="admin-form-input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>

                      <button type="submit" className="admin-save-btn" style={{ borderRadius: '4px', marginTop: '1rem' }}>
                        Change Password
                      </button>
                    </form>
                  </div>

                  {/* Email Management */}
                  <div className="admin-card">
                    <h2 className="admin-card-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={20} /> Account Email Settings
                    </h2>
                    
                    <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                      Current email: <strong>{adminEmail}</strong>
                    </div>

                    {emailStatus.msg && (
                      <div 
                        style={{ 
                          backgroundColor: emailStatus.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', 
                          color: emailStatus.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)', 
                          border: `1px solid ${emailStatus.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`, 
                          padding: '0.75rem 1rem', 
                          borderRadius: 'var(--radius-sm)', 
                          fontSize: '0.85rem', 
                          marginBottom: '1.25rem', 
                          fontWeight: 500 
                        }}
                      >
                        {emailStatus.msg}
                      </div>
                    )}

                    <form onSubmit={handleUpdateEmail}>
                      <div className="admin-form-group">
                        <label htmlFor="newEmail">New Email Address</label>
                        <input 
                          type="email" 
                          id="newEmail"
                          className="admin-form-input"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email address"
                          required
                        />
                      </div>

                      <button type="submit" className="admin-save-btn" style={{ borderRadius: '4px', marginTop: '1rem' }}>
                        Update Email Address
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW E: ADD/EDIT FORM OVERLAY */}
            {(editingItem || isAdding) && (
              <div className="admin-card">
                <h2 className="admin-card-title" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  {isAdding ? `Add New ${isAdding === 'product' ? 'Pickle' : 'Combo Pack'}` : `Edit ${editingItem.type === 'product' ? 'Product' : 'Combo Pack'}`}
                </h2>
                
                <form onSubmit={handleFormSave} className="admin-form">
                  <div className="admin-form-group">
                    <label>Item Name *</label>
                    <input 
                      type="text"
                      className="admin-form-input"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ginger Chicken Pickle"
                    />
                    {formErrors.name && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.name}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label>Description *</label>
                    <textarea 
                      className="admin-form-input"
                      style={{ minHeight: '100px', resize: 'vertical' }}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Traditional Andhra style slow-cooked ginger marinade..."
                    />
                    {formErrors.description && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.description}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label>Product Image File Path/URL *</label>
                    <input 
                      type="text"
                      className="admin-form-input"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="e.g. /images/products/chicken_pickle.png"
                    />
                    {formErrors.image_url && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.image_url}</span>}
                  </div>

                  {(isAdding === 'product' || editingItem?.type === 'product') ? (
                    <div className="price-fields-row">
                      <div className="admin-form-group">
                        <label>Price for 500gms (₹) *</label>
                        <input 
                          type="number"
                          className="admin-form-input"
                          value={formData.price_500gms || ''}
                          onChange={(e) => setFormData({ ...formData, price_500gms: e.target.value })}
                          placeholder="499"
                        />
                        {formErrors.price_500gms && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.price_500gms}</span>}
                      </div>
                      <div className="admin-form-group">
                        <label>Price for 1.0kg (₹) *</label>
                        <input 
                          type="number"
                          className="admin-form-input"
                          value={formData.price_1kg || ''}
                          onChange={(e) => setFormData({ ...formData, price_1kg: e.target.value })}
                          placeholder="999"
                        />
                        {formErrors.price_1kg && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.price_1kg}</span>}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="admin-form-group" style={{ maxWidth: '300px' }}>
                        <label>Combo Price (₹) *</label>
                        <input 
                          type="number"
                          className="admin-form-input"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="1299"
                        />
                        {formErrors.price && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.price}</span>}
                      </div>

                      <div className="admin-form-group">
                        <label>Combo Contents (exactly 4 items, 250g each)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#F8F6F2', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                          {formData.contents?.map((content, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                              <input 
                                type="text"
                                className="admin-form-input"
                                style={{ padding: '0.5rem' }}
                                value={content.name}
                                onChange={(e) => handleComboContentChange(idx, 'name', e.target.value)}
                                placeholder="Pickle Name"
                              />
                              <input 
                                type="text"
                                className="admin-form-input"
                                style={{ padding: '0.5rem' }}
                                value={content.weight}
                                onChange={(e) => handleComboContentChange(idx, 'weight', e.target.value)}
                                placeholder="250gms"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="admin-btn-row">
                    <button type="submit" className="admin-save-btn">
                      Save changes
                    </button>
                    <button 
                      type="button" 
                      className="admin-cancel-btn"
                      onClick={() => { setEditingItem(null); setIsAdding(null); }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </main>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
