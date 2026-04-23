"use client";
import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { groupByCategory } from "@/lib/utils";
import { formatUSD } from "@/lib/formatters";

const ALL = "All";

interface Props {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function ProductGrid({ products, onSelect }: Props) {
  const categories = [ALL, ...Array.from(new Set(products.map((p) => p.category))).sort()];
  const [active, setActive] = useState(ALL);
  const [variantParent, setVariantParent] = useState<Product | null>(null);

  const filtered = active === ALL ? products : products.filter((p) => p.category === active);

  function handleCardTap(product: Product) {
    if ((product.variants?.length ?? 0) > 0) {
      setVariantParent(product);
    } else {
      onSelect(product);
    }
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === cat
                ? "bg-primary text-surface"
                : "bg-dark/5 text-dark hover:bg-dark/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto flex-1 pr-1">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} onSelect={handleCardTap} />
        ))}
      </div>

      {/* Variant selector overlay */}
      {variantParent && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-dark/40 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-dark">{variantParent.name}</h3>
                <p className="text-xs text-dark/50">Select a variant</p>
              </div>
              <button
                onClick={() => setVariantParent(null)}
                className="rounded-lg p-2 text-dark/40 hover:bg-dark/5 hover:text-dark"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Parent itself if it has a price */}
              <button
                onClick={() => { onSelect(variantParent); setVariantParent(null); }}
                className="flex flex-col items-start gap-1 rounded-xl border-2 border-dark/10 p-4 text-left hover:border-primary transition-colors"
              >
                <p className="text-sm font-semibold text-dark">{variantParent.name}</p>
                <p className="text-xs text-dark/50">{formatUSD(variantParent.pricePerKgUSD)}/kg</p>
              </button>

              {/* Variants */}
              {variantParent.variants?.map((v) => (
                <button
                  key={v.id}
                  onClick={() => { onSelect(v); setVariantParent(null); }}
                  className="flex flex-col items-start gap-1 rounded-xl border-2 border-dark/10 p-4 text-left hover:border-primary transition-colors"
                >
                  <p className="text-sm font-semibold text-dark">{v.name}</p>
                  <p className="text-xs text-dark/50">{formatUSD(v.pricePerKgUSD)}/kg</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
