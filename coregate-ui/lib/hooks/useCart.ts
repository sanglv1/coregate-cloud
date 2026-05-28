'use client';

import { useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const STORAGE_KEY = 'coregate_cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loading]);

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.productId === item.productId);
      if (existing) {
        return prevItems.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    loading,
    total,
    count,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
