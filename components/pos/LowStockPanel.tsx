"use client";
import { X, AlertTriangle } from "lucide-react";
import type { Product } from "@/types";
import { formatWeight, formatUSD } from "@/lib/formatters";

interface Props {
  products: Product[];
  onClose: () => void;
}

export function LowStockPanel({ products, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-dark/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-80 bg-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark/10">
          <div className="flex items-center gap-2 text-alert">
            <AlertTriangle size={16} />
            <h2 className="font-semibold text-sm">Low Stock ({products.length})</h2>
          </div>
          <button onClick={onClose} className="text-dark/40 hover:text-dark transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {products.length === 0 ? (
            <p className="text-sm text-dark/40 text-center py-8">All products well-stocked.</p>
          ) : (
            products.map((p) => (
              <div key={p.id} className="rounded-lg bg-white border border-alert/15 px-4 py-3">
                <p className="text-sm font-semibold text-dark">{p.name}</p>
                <p className="text-xs text-dark/50 mt-0.5">{p.category} · {formatUSD(p.pricePerKgUSD)}/kg</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-alert font-medium">
                    {formatWeight(p.stockKg)} remaining
                  </span>
                  <span className="text-xs text-dark/30">
                    alert at {formatWeight(p.lowStockThresholdKg)}
                  </span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-dark/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-alert/60"
                    style={{ width: `${Math.min(100, (p.stockKg / p.lowStockThresholdKg) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
