"use client";
import { AlertTriangle } from "lucide-react";
import type { Product } from "@/types";
import { formatUSD, formatWeight } from "@/lib/formatters";
import { isLowStock } from "@/lib/utils";

interface Props {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: Props) {
  const low = isLowStock(product.stockKg, product.lowStockThresholdKg);
  const price = product.soldByWeight
    ? `${formatUSD(product.pricePerKgUSD)}/kg`
    : formatUSD(product.pricePerUnitUSD ?? product.pricePerKgUSD);

  return (
    <button
      onClick={() => onSelect(product)}
      className="relative flex flex-col items-start gap-1 rounded-xl border border-dark/10 bg-white p-4 text-left shadow-sm transition-all hover:border-primary hover:shadow-md active:scale-95 w-full"
    >
      {low && (
        <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-alert/10 px-1.5 py-0.5 text-[10px] font-semibold text-alert">
          <AlertTriangle size={10} />
          Low
        </span>
      )}
      <span className="text-sm font-semibold text-dark leading-tight pr-8">{product.name}</span>
      <span className="text-xs text-dark/50">{product.category}</span>
      <span className="mt-1 text-base font-bold text-primary">{price}</span>
      <span className="text-[11px] text-dark/40">{formatWeight(product.stockKg)} in stock</span>
    </button>
  );
}
