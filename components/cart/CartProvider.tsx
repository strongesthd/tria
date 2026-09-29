"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../../lib/site-data";

export type CartItem = Product & { quantity: number };
export type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: Product) => void;
  remove: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);
const CART_STORAGE_KEY = "tria-cart-v1";
const MAX_ITEM_QUANTITY = 99;

function isStoredCart(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<CartItem>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.name === "string" &&
      typeof candidate.price === "number" &&
      Number.isFinite(candidate.price) &&
      typeof candidate.quantity === "number" &&
      Number.isInteger(candidate.quantity) &&
      candidate.quantity > 0 &&
      candidate.quantity <= MAX_ITEM_QUANTITY
    );
  });
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider.");
  return ctx;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read after mount to keep the server HTML deterministic and avoid a
  // hydration mismatch. Invalid or stale storage is discarded safely.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isStoredCart(parsed)) setItems(parsed);
        else window.localStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch {
      // Storage can be disabled or contain malformed JSON; start with an empty cart.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (items.length) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      else window.localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Quota/private-mode errors must not block checkout or product browsing.
    }
  }, [hydrated, items]);

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);

  const add = useCallback(
    (product: Product) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id
              ? { ...i, quantity: Math.min(MAX_ITEM_QUANTITY, i.quantity + 1) }
              : i
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      setOpen(true);
    },
    []
  );

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.id !== productId);
      return prev.map((i) =>
        i.id === productId
          ? { ...i, quantity: Math.min(MAX_ITEM_QUANTITY, Math.floor(quantity)) }
          : i
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, updateQuantity, clear, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}
