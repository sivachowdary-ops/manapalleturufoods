-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. Products Table
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  image_url text not null,
  price_500gms integer not null,
  price_1kg integer not null,
  category text not null default 'Pickles',
  in_stock boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Combos Table
create table if not exists combos (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  image_url text not null,
  price integer not null,
  contents jsonb not null, -- Array of objects: [{"name": "Chicken Pickle", "weight": "250gms"}]
  is_best_seller boolean not null default true,
  in_stock boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Orders Table (WhatsApp Checkout Attempts)
create table if not exists orders (
  id serial primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_state text not null,
  cart_contents jsonb not null, -- Array of items with selected weights and quantities
  total_weight_gms integer not null,
  subtotal integer not null,
  status text not null default 'Pending', -- 'Pending', 'Confirmed', 'Shipped', 'Cancelled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Configuration
alter table products enable row level security;
alter table combos enable row level security;
alter table orders enable row level security;

-- Read policies: anyone can view products/combos
create policy "Allow public read access to products" on products
  for select using (true);

create policy "Allow public read access to combos" on combos
  for select using (true);

-- Insert policy: anyone can insert orders (needed for checkout logging)
create policy "Allow public insert access to orders" on orders
  for insert with check (true);

-- Admin policies: only authenticated users can edit products, combos, and read/update orders
create policy "Allow admin full access to products" on products
  for all to authenticated using (true);

create policy "Allow admin full access to combos" on combos
  for all to authenticated using (true);

create policy "Allow admin full access to orders" on orders
  for all to authenticated using (true);


-- 4. Seed Data: Individual Pickle Products
insert into products (name, description, image_url, price_500gms, price_1kg, category, in_stock) values
(
  'Chicken Pickle',
  'Authentic Andhra-style spicy chicken pickle, made with bone-in chicken pieces slow-cooked in cold-pressed groundnut oil, marinated in hand-ground spices and lemon juice. Glistening, rich, and intensely flavorful.',
  '/images/products/chicken_pickle.png',
  499,
  999,
  'Pickles',
  true
),
(
  'Chicken Boneless Pickle',
  'Premium boneless chicken pickle featuring tender, juicy chunks of chicken marinated in a secret blend of traditional spices, garlic, ginger, and lemon juice. Glistening in rich masala oil for the ultimate non-veg pickle experience.',
  '/images/products/chicken_boneless_pickle.png',
  649,
  1299,
  'Pickles',
  true
),
(
  'Chicken Kheema Pickle',
  'Delectable minced chicken pickle. Finely ground country chicken cooked to perfection with traditional Andhra spices and aromatic herbs, creating a rich, spreadable, oil-glazed pickle perfect with warm rice and ghee.',
  '/images/products/chicken_kheema_pickle.png',
  699,
  1399,
  'Pickles',
  true
),
(
  'Naatu Kodi Pickle',
  'Country Chicken Pickle. Traditional Andhra delicacy made with organic, free-range country chicken. Slow-cooked with bones, rich in traditional spices, coated in rich spice paste and sesame oil for an authentic village taste.',
  '/images/products/naatu_kodi_pickle.png',
  749,
  1499,
  'Pickles',
  true
),
(
  'Mutton Boneless Pickle',
  'Royal and premium boneless mutton pickle. Ultra-tender, juicy chunks of premium boneless mutton, slow-cooked in a robust spice blend, marinated in lemon juice and oil. A gourmet delicacy prepared in traditional clay pot style.',
  '/images/products/mutton_boneless_pickle.png',
  999,
  1949,
  'Pickles',
  true
),
(
  'Mutton Kheema Pickle',
  'Exquisite minced mutton pickle. Finely ground tender mutton cooked with aromatic ground spices, garlic, ginger, and cold-pressed oil, yielding a thick, spice-rich, savory paste that makes every meal luxurious.',
  '/images/products/mutton_kheema_pickle.png',
  1049,
  1999,
  'Pickles',
  true
),
(
  'Prawn Pickle',
  'Sensational Andhra prawn pickle. Freshly caught succulent prawns, marinated in traditional spices and lemon, slow-cooked till tender in mustard and groundnut oil. Glistening, spicy, and incredibly appetizing.',
  '/images/products/prawn_pickle.png',
  749,
  1699,
  'Pickles',
  true
),
(
  'Fish Pickle (Apollo)',
  'Authentic Apollo Fish pickle made with fresh boneless fish fillets, crispy-cooked and tossed in a rich, oil-glazed, spice-laden marinade. Tangy, spicy, and perfectly seasoned with hand-made Andhra masala.',
  '/images/products/fish_pickle.png',
  749,
  1699,
  'Pickles',
  true
);

-- 5. Seed Data: Combo Packs (Non-Veg Combos 1, 2, and 3)
insert into combos (name, description, image_url, price, contents, is_best_seller) values
(
  'Non-Veg Combo 1',
  'The ultimate feast for chicken lovers! Features 250gms each of our four premium chicken pickles: Chicken Pickle, Chicken Boneless Pickle, Chicken Kheema Pickle, and Naatu Kodi Pickle.',
  '/images/products/combo_1.png',
  1299,
  '[
    {"name": "Chicken Pickle", "weight": "250gms"},
    {"name": "Chicken Boneless Pickle", "weight": "250gms"},
    {"name": "Chicken Kheema Pickle", "weight": "250gms"},
    {"name": "Naatu Kodi Pickle", "weight": "250gms"}
  ]'::jsonb,
  true
),
(
  'Non-Veg Combo 2',
  'A diverse and mouthwatering assortment of our best non-veg pickles. Includes 250gms each of Chicken Pickle, Mutton Boneless Pickle, Prawn Pickle, and Fish Pickle.',
  '/images/products/combo_2.png',
  1549,
  '[
    {"name": "Chicken Pickle", "weight": "250gms"},
    {"name": "Mutton Boneless Pickle", "weight": "250gms"},
    {"name": "Prawn Pickle", "weight": "250gms"},
    {"name": "Fish Pickle", "weight": "250gms"}
  ]'::jsonb,
  true
),
(
  'Non-Veg Combo 3',
  'Our premium, luxury selection. Features 250gms each of Mutton Boneless Pickle, Naatu Kodi Pickle, Fish Pickle, and Prawn Pickle.',
  '/images/products/combo_3.png',
  1699,
  '[
    {"name": "Mutton Boneless Pickle", "weight": "250gms"},
    {"name": "Naatu Kodi Pickle", "weight": "250gms"},
    {"name": "Fish Pickle", "weight": "250gms"},
    {"name": "Prawn Pickle", "weight": "250gms"}
  ]'::jsonb,
  true
);
