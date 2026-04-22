"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { useSaleCart } from "@/hooks/useSaleCart";
import { isLowStock } from "@/lib/utils";
import { ProductGrid } from "./ProductGrid";
import { WeightInput } from "./WeightInput";
import { CartPanel } from "./CartPanel";
import { CheckoutModal } from "./CheckoutModal";
import { LowStockPanel } from "./LowStockPanel";
import { StaleRateBanner } from "@/components/shared/StaleRateBanner";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";

interface Props {
  products: Product[];
  exchangeRate: number;
  rateUpdatedAt: Date;
}

export function POSTerminal({ products, exchangeRate, rateUpdatedAt }: Props) {
  const { items, totalUSD, addItem, clearCart } = useSaleCart();
  const [selected, setSelected] = useState<Product | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [lowStockOpen, setLowStockOpen] = useState(false);

  const lowStockProducts = products.filter((p) => isLowStock(p.stockKg, p.lowStockThresholdKg));

  function handleSelect(product: Product) {
    setSelected(product);
    setCartOpen(false);
  }

  function handleConfirmQty(qty: number) {
    if (!selected) return;
    addItem(selected, qty);
    setSelected(null);
  }

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      <OfflineIndicator />

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-dark text-surface shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Image src="/logo.png" alt="CounterStock" width={140} height={36} className="object-contain brightness-0 invert" />
          <span className="text-secondary text-xs font-medium hidden sm:inline">POS</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-surface/40 hidden md:block">
            1 USD = {exchangeRate} ZWG
          </span>

          {/* Low stock button */}
          {lowStockProducts.length > 0 && (
            <button
              onClick={() => setLowStockOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-alert/20 hover:bg-alert/30 transition-colors px-3 py-1.5 text-alert text-xs font-semibold"
            >
              <AlertTriangle size={13} />
              <span>{lowStockProducts.length} low</span>
            </button>
          )}

          {/* Mobile cart toggle */}
          <button
            onClick={() => setCartOpen((v) => !v)}
            className="relative flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors p-2 md:hidden"
            aria-label="Toggle cart"
          >
            <ShoppingCart size={18} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-dark text-[10px] font-bold">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Secondary nav */}
      <nav className="bg-dark/90 border-t border-white/10 px-4 py-1.5 flex items-center gap-5 shrink-0">
        <Link href="/inventory" className="text-surface/55 hover:text-surface text-xs font-medium transition-colors">
          Inventory
        </Link>
        <Link href="/reports" className="text-surface/55 hover:text-surface text-xs font-medium transition-colors">
          Reports
        </Link>
        <Link href="/admin" className="text-surface/55 hover:text-surface text-xs font-medium transition-colors">
          Admin
        </Link>
      </nav>

      {/* Stale rate banner */}
      <div className="px-4 pt-3 shrink-0">
        <StaleRateBanner updatedAt={rateUpdatedAt} />
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Product area — hidden on mobile when cart is open */}
        <main className={`flex-1 overflow-hidden p-4 ${cartOpen ? "hidden md:block" : "block"}`}>
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

        {/* Cart sidebar — full screen on mobile when open, fixed sidebar on md+ */}
        <aside
          className={`
            bg-white border-l border-dark/10 flex flex-col
            ${cartOpen ? "flex w-full md:w-80" : "hidden md:flex md:w-80"}
            shrink-0 overflow-hidden
          `}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
            <h2 className="text-sm font-semibold text-dark/60 uppercase tracking-wide">
              Cart ({items.length})
            </h2>
            {cartOpen && (
              <button
                onClick={() => setCartOpen(false)}
                className="text-dark/40 hover:text-dark text-xs md:hidden"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
            <CartPanel
              exchangeRate={exchangeRate}
              onCheckout={() => { setCheckingOut(true); setCartOpen(false); }}
            />
          </div>
        </aside>
      </div>

      {/* Low stock panel */}
      {lowStockOpen && (
        <LowStockPanel
          products={lowStockProducts}
          onClose={() => setLowStockOpen(false)}
        />
      )}

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
