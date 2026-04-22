"use client";
import { useState } from "react";
import type { Product } from "@/types";
import { useSaleCart } from "@/hooks/useSaleCart";
import { ProductGrid } from "./ProductGrid";
import { WeightInput } from "./WeightInput";
import { CartPanel } from "./CartPanel";
import { CheckoutModal } from "./CheckoutModal";
import { StaleRateBanner } from "@/components/shared/StaleRateBanner";

interface Props {
  products: Product[];
  exchangeRate: number;
  rateUpdatedAt: Date;
}

export function POSTerminal({ products, exchangeRate, rateUpdatedAt }: Props) {
  const { items, totalUSD, addItem, clearCart } = useSaleCart();
  const [selected, setSelected] = useState<Product | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  function handleSelect(product: Product) {
    setSelected(product);
  }

  function handleConfirmQty(qty: number) {
    if (!selected) return;
    addItem(selected, qty);
    setSelected(null);
  }

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 bg-dark text-surface shrink-0">
        <div>
          <span className="font-bold text-lg tracking-tight">CounterStock</span>
          <span className="ml-2 text-secondary text-xs font-medium">POS</span>
        </div>
        <div className="text-xs text-surface/50">
          Rate: 1 USD = {exchangeRate} ZWG
        </div>
      </header>

      {/* Stale rate banner */}
      <div className="px-4 pt-3 shrink-0">
        <StaleRateBanner updatedAt={rateUpdatedAt} />
      </div>

      {/* Main layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Product area */}
        <main className="flex-1 overflow-hidden p-4">
          {selected ? (
            <div className="max-w-sm mx-auto pt-4">
              <WeightInput
                product={selected}
                onConfirm={handleConfirmQty}
                onCancel={() => setSelected(null)}
              />
            </div>
          ) : (
            <ProductGrid products={products} onSelect={handleSelect} />
          )}
        </main>

        {/* Cart sidebar */}
        <aside className="w-80 shrink-0 border-l border-dark/10 p-4 bg-white overflow-hidden flex flex-col">
          <h2 className="text-sm font-semibold text-dark/60 uppercase tracking-wide mb-3">
            Cart ({items.length})
          </h2>
          <div className="flex-1 overflow-hidden flex flex-col">
            <CartPanel
              exchangeRate={exchangeRate}
              onCheckout={() => setCheckingOut(true)}
            />
          </div>
        </aside>
      </div>

      {/* Checkout modal */}
      {checkingOut && (
        <CheckoutModal
          items={items}
          totalUSD={totalUSD}
          exchangeRate={exchangeRate}
          onComplete={() => { clearCart(); setCheckingOut(false); }}
          onClose={() => setCheckingOut(false)}
        />
      )}
    </div>
  );
}
