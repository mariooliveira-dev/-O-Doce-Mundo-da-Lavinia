import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutLavinia } from './components/AboutLavinia';
import { MenuSection } from './components/MenuSection';
import { InstagramFeed } from './components/InstagramFeed';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanelModal } from './components/AdminPanelModal';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { ScrollToTop } from './components/ScrollToTop';
import { AdminProvider } from './context/AdminContext';
import { CartItem } from './types';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      // Check if duplicate item exists
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === newItem.product.id &&
          item.selectedFlavor === newItem.selectedFlavor &&
          item.customInscription === newItem.customInscription
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newQty = current.quantity + newItem.quantity;
        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          totalPrice: (current.totalPrice / current.quantity) * newQty,
        };
        return updated;
      }
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const unitPrice = item.totalPrice / item.quantity;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const scrollToMenu = () => {
    const el = document.getElementById('cardapio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AdminProvider>
      <div className="min-h-screen bg-[#FFF5F7] text-[#3D231D] flex flex-col font-body selection:bg-[#F4ACB7] selection:text-white">
        
        {/* Sticky Top Header Navigation */}
        <Navbar
          cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Main Page Layout */}
        <main className="flex-1">
          
          {/* Hero Section */}
          <Hero
            onScrollToMenu={scrollToMenu}
          />

          {/* About Lavinia Section */}
          <AboutLavinia />

          {/* Digital Product Menu */}
          <MenuSection
            onAddToCart={handleAddToCart}
          />

          {/* Instagram Feed Section */}
          <InstagramFeed />

          {/* Customer Testimonials */}
          <Testimonials />

          {/* Frequently Asked Questions */}
          <FAQ />

        </main>

        {/* Footer */}
        <Footer />

        {/* Cart & WhatsApp Checkout Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
        />

        {/* Discreet Admin Management Modal */}
        <AdminPanelModal />

        {/* Floating WhatsApp Action Button */}
        <WhatsAppFloat />

        {/* Quick Scroll to Top Floating Button */}
        <ScrollToTop />

      </div>
    </AdminProvider>
  );
}


