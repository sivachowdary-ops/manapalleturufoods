import HomeClient from './HomeClient';
import { getProducts, getCombos } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';

// Enable Incremental Static Regeneration (ISR) to render the catalog at Vercel's edge.
// This serves the home page instantly (0ms loading latency) while revalidating data in the background.
export const revalidate = 60; 

export default async function HomePage() {
  let products = [];
  let combos = [];
  
  try {
    const prodData = await getProducts();
    const comboData = await getCombos();
    products = prodData ? prodData.filter(p => p.in_stock) : [];
    combos = comboData ? comboData.filter(c => c.in_stock) : [];
  } catch (e) {
    console.error("Failed to load catalog data on server:", e);
  }

  return (
    <HomeClient 
      initialProducts={products} 
      initialCombos={combos} 
      isDbMock={!isSupabaseConfigured} 
    />
  );
}
