import { supabase, isSupabaseConfigured } from './supabase';

// Seed data to initialize the catalog in Mock Mode
const SEED_PRODUCTS = [
  {
    id: 'p1',
    name: 'Chicken Pickle',
    description: 'Authentic Andhra-style spicy chicken pickle, made with bone-in chicken pieces slow-cooked in cold-pressed groundnut oil, marinated in hand-ground spices and lemon juice. Glistening, rich, and intensely flavorful.',
    image_url: '/images/products/chicken_pickle.png',
    price_500gms: 499,
    price_1kg: 999,
    category: 'Pickles',
    in_stock: true
  },
  {
    id: 'p2',
    name: 'Chicken Boneless Pickle',
    description: 'Premium boneless chicken pickle featuring tender, juicy chunks of chicken marinated in a secret blend of traditional spices, garlic, ginger, and lemon juice. Glistening in rich masala oil for the ultimate non-veg pickle experience.',
    image_url: '/images/products/chicken_boneless_pickle.png',
    price_500gms: 649,
    price_1kg: 1299,
    category: 'Pickles',
    in_stock: true
  },
  {
    id: 'p3',
    name: 'Chicken Kheema Pickle',
    description: 'Delectable minced chicken pickle. Finely ground country chicken cooked to perfection with traditional Andhra spices and aromatic herbs, creating a rich, spreadable, oil-glazed pickle perfect with warm rice and ghee.',
    image_url: '/images/products/chicken_kheema_pickle.png',
    price_500gms: 699,
    price_1kg: 1399,
    category: 'Pickles',
    in_stock: true
  },
  {
    id: 'p4',
    name: 'Naatu Kodi Pickle',
    description: 'Country Chicken Pickle. Traditional Andhra delicacy made with organic, free-range country chicken. Slow-cooked with bones, rich in traditional spices, coated in rich spice paste and sesame oil for an authentic village taste.',
    image_url: '/images/products/naatu_kodi_pickle.png',
    price_500gms: 749,
    price_1kg: 1499,
    category: 'Pickles',
    in_stock: true
  },
  {
    id: 'p5',
    name: 'Mutton Boneless Pickle',
    description: 'Royal and premium boneless mutton pickle. Ultra-tender, juicy chunks of premium boneless mutton, slow-cooked in a robust spice blend, marinated in lemon juice and oil. A gourmet delicacy prepared in traditional clay pot style.',
    image_url: '/images/products/mutton_boneless_pickle.png',
    price_500gms: 999,
    price_1kg: 1949,
    category: 'Pickles',
    in_stock: true
  },
  {
    id: 'p6',
    name: 'Mutton Kheema Pickle',
    description: 'Exquisite minced mutton pickle. Finely ground tender mutton cooked with aromatic ground spices, garlic, ginger, and cold-pressed oil, yielding a thick, spice-rich, savory paste that makes every meal luxurious.',
    image_url: '/images/products/mutton_kheema_pickle.png',
    price_500gms: 1049,
    price_1kg: 1999,
    category: 'Pickles',
    in_stock: true
  },
  {
    id: 'p7',
    name: 'Prawn Pickle',
    description: 'Sensational Andhra prawn pickle. Freshly caught succulent prawns, marinated in traditional spices and lemon, slow-cooked till tender in mustard and groundnut oil. Glistening, spicy, and incredibly appetizing.',
    image_url: '/images/products/prawn_pickle.png',
    price_500gms: 749,
    price_1kg: 1699,
    category: 'Pickles',
    in_stock: true
  },
  {
    id: 'p8',
    name: 'Fish Pickle (Apollo)',
    description: 'Authentic Apollo Fish pickle made with fresh boneless fish fillets, crispy-cooked and tossed in a rich, oil-glazed, spice-laden marinade. Tangy, spicy, and perfectly seasoned with hand-made Andhra masala.',
    image_url: '/images/products/fish_pickle.png',
    price_500gms: 749,
    price_1kg: 1699,
    category: 'Pickles',
    in_stock: true
  }
];

const SEED_COMBOS = [
  {
    id: 'c1',
    name: 'Non-Veg Combo 1',
    description: 'The ultimate feast for chicken lovers! Features 250gms each of our four premium chicken pickles: Chicken Pickle, Chicken Boneless Pickle, Chicken Kheema Pickle, and Naatu Kodi Pickle.',
    image_url: '/images/products/combo_1.png',
    price: 1299,
    contents: [
      { name: 'Chicken Pickle', weight: '250gms' },
      { name: 'Chicken Boneless Pickle', weight: '250gms' },
      { name: 'Chicken Kheema Pickle', weight: '250gms' },
      { name: 'Naatu Kodi Pickle', weight: '250gms' }
    ],
    is_best_seller: true,
    in_stock: true
  },
  {
    id: 'c2',
    name: 'Non-Veg Combo 2',
    description: 'A diverse and mouthwatering assortment of our best non-veg pickles. Includes 250gms each of Chicken Pickle, Mutton Boneless Pickle, Prawn Pickle, and Fish Pickle.',
    image_url: '/images/products/combo_2.png',
    price: 1549,
    contents: [
      { name: 'Chicken Pickle', weight: '250gms' },
      { name: 'Mutton Boneless Pickle', weight: '250gms' },
      { name: 'Prawn Pickle', weight: '250gms' },
      { name: 'Fish Pickle', weight: '250gms' }
    ],
    is_best_seller: true,
    in_stock: true
  },
  {
    id: 'c3',
    name: 'Non-Veg Combo 3',
    description: 'Our premium, luxury selection. Features 250gms each of Mutton Boneless Pickle, Naatu Kodi Pickle, Fish Pickle, and Prawn Pickle.',
    image_url: '/images/products/combo_3.png',
    price: 1699,
    contents: [
      { name: 'Mutton Boneless Pickle', weight: '250gms' },
      { name: 'Naatu Kodi Pickle', weight: '250gms' },
      { name: 'Fish Pickle', weight: '250gms' },
      { name: 'Prawn Pickle', weight: '250gms' }
    ],
    is_best_seller: true,
    in_stock: true
  }
];

// Helper to get item from localStorage or initialize with seed data
function getLocalItems(key, initialData) {
  if (typeof window === 'undefined') return initialData;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialData;
  }
}

function setLocalItems(key, data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Check database connection mode
export function getDbMode() {
  return isSupabaseConfigured ? 'Supabase' : 'MockStorage';
}

// ---------------- PRODUCTS CRUD ----------------

export async function getProducts() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) return data;
      console.warn("Supabase products fetch error, using local fallback:", error);
    } catch (e) {
      console.warn("Supabase query failed, falling back:", e);
    }
  }
  return getLocalItems('mp_products', SEED_PRODUCTS);
}

export async function getProductById(id) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return data;
      console.warn(`Supabase fetch product ${id} error, fallback:`, error);
    } catch (e) {
      console.warn("Supabase product fetch failed:", e);
    }
  }
  const products = getLocalItems('mp_products', SEED_PRODUCTS);
  return products.find(p => p.id === id) || null;
}

export async function saveProduct(product) {
  if (isSupabaseConfigured) {
    try {
      if (product.id && !product.id.startsWith('p')) {
        // Edit existing product in Supabase
        const { data, error } = await supabase
          .from('products')
          .update(product)
          .eq('id', product.id)
          .select()
          .single();
        if (!error && data) return data;
        throw error;
      } else {
        // Insert new product (strip mock prefixed IDs if any)
        const cleanProduct = { ...product };
        if (cleanProduct.id && cleanProduct.id.startsWith('p')) {
          delete cleanProduct.id;
        }
        const { data, error } = await supabase
          .from('products')
          .insert(cleanProduct)
          .select()
          .single();
        if (!error && data) return data;
        throw error;
      }
    } catch (e) {
      console.error("Supabase product save failed, writing to localStorage:", e);
    }
  }

  // Fallback local storage CRUD
  const products = getLocalItems('mp_products', SEED_PRODUCTS);
  if (product.id) {
    const idx = products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...product };
      setLocalItems('mp_products', products);
      return products[idx];
    }
  }
  const newProduct = {
    ...product,
    id: `p_${Date.now()}`,
    created_at: new Date().toISOString()
  };
  products.push(newProduct);
  setLocalItems('mp_products', products);
  return newProduct;
}

export async function deleteProduct(id) {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (!error) return true;
      throw error;
    } catch (e) {
      console.error("Supabase product delete failed, writing to localStorage:", e);
    }
  }
  const products = getLocalItems('mp_products', SEED_PRODUCTS);
  const filtered = products.filter(p => p.id !== id);
  setLocalItems('mp_products', filtered);
  return true;
}

// ---------------- COMBOS CRUD ----------------

export async function getCombos() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('combos')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) return data;
      console.warn("Supabase combos fetch error, using local fallback:", error);
    } catch (e) {
      console.warn("Supabase query failed, falling back:", e);
    }
  }
  return getLocalItems('mp_combos', SEED_COMBOS);
}

export async function getComboById(id) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('combos')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return data;
      console.warn(`Supabase fetch combo ${id} error, fallback:`, error);
    } catch (e) {
      console.warn("Supabase combo fetch failed:", e);
    }
  }
  const combos = getLocalItems('mp_combos', SEED_COMBOS);
  return combos.find(c => c.id === id) || null;
}

export async function saveCombo(combo) {
  if (isSupabaseConfigured) {
    try {
      if (combo.id && !combo.id.startsWith('c')) {
        const { data, error } = await supabase
          .from('combos')
          .update(combo)
          .eq('id', combo.id)
          .select()
          .single();
        if (!error && data) return data;
        throw error;
      } else {
        const cleanCombo = { ...combo };
        if (cleanCombo.id && cleanCombo.id.startsWith('c')) {
          delete cleanCombo.id;
        }
        const { data, error } = await supabase
          .from('combos')
          .insert(cleanCombo)
          .select()
          .single();
        if (!error && data) return data;
        throw error;
      }
    } catch (e) {
      console.error("Supabase combo save failed, writing to localStorage:", e);
    }
  }

  const combos = getLocalItems('mp_combos', SEED_COMBOS);
  if (combo.id) {
    const idx = combos.findIndex(c => c.id === combo.id);
    if (idx !== -1) {
      combos[idx] = { ...combos[idx], ...combo };
      setLocalItems('mp_combos', combos);
      return combos[idx];
    }
  }
  const newCombo = {
    ...combo,
    id: `c_${Date.now()}`,
    created_at: new Date().toISOString()
  };
  combos.push(newCombo);
  setLocalItems('mp_combos', combos);
  return newCombo;
}

export async function deleteCombo(id) {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('combos')
        .delete()
        .eq('id', id);
      if (!error) return true;
      throw error;
    } catch (e) {
      console.error("Supabase combo delete failed, writing to localStorage:", e);
    }
  }
  const combos = getLocalItems('mp_combos', SEED_COMBOS);
  const filtered = combos.filter(c => c.id !== id);
  setLocalItems('mp_combos', filtered);
  return true;
}

// ---------------- ORDERS CRUD ----------------

export async function createOrder(order) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
      if (!error && data) return data;
      throw error;
    } catch (e) {
      console.error("Supabase order insert failed, logging locally:", e);
    }
  }

  // Local storage mock order
  const orders = getLocalItems('mp_orders', []);
  const newOrder = {
    ...order,
    id: orders.length + 1,
    status: 'Pending',
    created_at: new Date().toISOString()
  };
  orders.push(newOrder);
  setLocalItems('mp_orders', orders);
  return newOrder;
}

export async function getOrders() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
      console.warn("Supabase orders fetch error, using local fallback:", error);
    } catch (e) {
      console.warn("Supabase query failed, falling back:", e);
    }
  }
  return getLocalItems('mp_orders', []);
}

export async function updateOrderStatus(orderId, status) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
      if (!error && data) return data;
      throw error;
    } catch (e) {
      console.error("Supabase order update failed, writing to localStorage:", e);
    }
  }

  const orders = getLocalItems('mp_orders', []);
  const idx = orders.findIndex(o => Number(o.id) === Number(orderId) || o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    setLocalItems('mp_orders', orders);
    return orders[idx];
  }
  return null;
}
