import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Membership } from '../data/memberships';

interface CartItem {
  membership: Membership;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (membership: Membership) => void;
  removeFromCart: (membershipId: string) => void;
  updateQuantity: (membershipId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (membership: Membership) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.membership.id === membership.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.membership.id === membership.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { membership, quantity: 1 }];
    });
  };

  const removeFromCart = (membershipId: string) => {
    setItems(currentItems => currentItems.filter(item => item.membership.id !== membershipId));
  };

  const updateQuantity = (membershipId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(membershipId);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.membership.id === membershipId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.membership.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 