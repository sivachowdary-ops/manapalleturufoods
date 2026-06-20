import { CartProvider } from '@/context/CartContext';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata = {
  title: "Mana Palleturu Foods | Premium Andhra Non-Vegetarian Pickles",
  description: "Authentic, slow-cooked non-vegetarian chicken, mutton, prawn, and fish pickles. No artificial preservatives, 100% natural, delivered fresh to your door.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <CartProvider>
          <NavbarWrapper />
          <main style={{ flexGrow: 1 }}>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
