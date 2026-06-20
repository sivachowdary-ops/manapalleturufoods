'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('mp_cart');
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('mp_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product, weight, price, quantity = 1) => {
    setCart((prevCart) => {
      // Find if item already exists with the same ID and selected weight
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.selectedWeight === weight
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            image_url: product.image_url,
            selectedWeight: weight,
            price: price,
            quantity: quantity,
            isCombo: !weight.includes('gms') && !weight.includes('kg') ? false : product.contents !== undefined
          }
        ];
      }
    });
  };

  const updateQuantity = (id, weight, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, weight);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.selectedWeight === weight
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (id, weight) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.id === id && item.selectedWeight === weight)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cartWeightGms = cart.reduce((sum, item) => {
    // Parse weight
    let weightInGms = 0;
    if (item.selectedWeight === '500gms') {
      weightInGms = 500;
    } else if (item.selectedWeight === '1kg') {
      weightInGms = 1000;
    } else {
      // It's a combo, which is fixed at 1kg (1000gms) total
      weightInGms = 1000;
    }
    return sum + weightInGms * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        cartWeightGms,
        isLoaded
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
