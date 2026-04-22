"use client";
import { useState } from "react";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { groupByCategory } from "@/lib/utils";

const ALL = "All";

interface Props {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function ProductGrid({ products, onSelect }: Props) {
  const categories = [ALL, ...Array.from(new Set(products.map((p) => p.category))).sort()];
  const [active, setActive] = useState(ALL);

  const filtered = active === ALL ? products : products.filter((p) => p.category === active);

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
          <ProductCard key={product.id} product={product} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
