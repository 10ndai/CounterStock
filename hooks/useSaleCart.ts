"use client";
import { create } from "zustand";
import type { Product, CartItem } from "@/types";

interface SaleCartState {
  items: CartItem[];
  totalUSD: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

function calcTotal(items: CartItem[]): number {
  return parseFloat(items.reduce((sum, i) => sum + i.totalUSD, 0).toFixed(2));
}

export const useSaleCart = create<SaleCartState>((set) => ({
  items: [],
  totalUSD: 0,

  addItem: (product, quantity) => {
    const unitPrice = product.soldByWeight
      ? product.pricePerKgUSD
      : (product.pricePerUnitUSD ?? product.pricePerKgUSD);
    const totalUSD = parseFloat((unitPrice * quantity).toFixed(2));

    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      let nextItems: CartItem[];

      if (existing) {
        const newQty = parseFloat((existing.quantity + quantity).toFixed(3));
        const newTotal = parseFloat((unitPrice * newQty).toFixed(2));
        nextItems = state.items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: newQty, totalUSD: newTotal }
            : i
        );
      } else {
        nextItems = [...state.items, { product, quantity, totalUSD }];
      }

      return { items: nextItems, totalUSD: calcTotal(nextItems) };
    });
  },

  removeItem: (productId) =>
    set((state) => {
      const nextItems = state.items.filter((i) => i.product.id !== productId);
      return { items: nextItems, totalUSD: calcTotal(nextItems) };
    }),

  clearCart: () => set({ items: [], totalUSD: 0 }),
}));
