"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { CartItem, CustomerDetails } from "@/lib/types";

const CART_STORAGE_KEY = "tshirt_cart_item";
const CUSTOMER_STORAGE_KEY = "tshirt_customer_details";

interface CartContextValue {
  item: CartItem | null;
  setItem: (item: CartItem) => void;
  updateQuantity: (quantity: number) => void;
  clearItem: () => void;
  customer: CustomerDetails | null;
  setCustomer: (customer: CustomerDetails) => void;
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [item, setItemState] = useState<CartItem | null>(null);
  const [customer, setCustomerState] = useState<CustomerDetails | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage after mount — this can't run during
    // render since localStorage isn't available on the server.
    try {
      const rawItem = localStorage.getItem(CART_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (rawItem) setItemState(JSON.parse(rawItem));
      const rawCustomer = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (rawCustomer) setCustomerState(JSON.parse(rawCustomer));
    } catch {
      // ignore corrupt storage
    } finally {
      setHydrated(true);
    }
  }, []);

  const setItem = (next: CartItem) => {
    setItemState(next);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  };

  const updateQuantity = (quantity: number) => {
    setItemState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, quantity };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearItem = () => {
    setItemState(null);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const setCustomer = (next: CustomerDetails) => {
    setCustomerState(next);
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <CartContext.Provider
      value={{ item, setItem, updateQuantity, clearItem, customer, setCustomer, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
