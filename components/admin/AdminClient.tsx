"use client";
import { useState } from "react";
import type { Product } from "@/types";
import { ProductList } from "./ProductList";
import { RateManager } from "./RateManager";

interface Props {
  products: Product[];
  exchangeRate: number;
  rateUpdatedAt: Date;
}

type Tab = "products" | "rate";

export function AdminClient({ products, exchangeRate, rateUpdatedAt }: Props) {
  const [tab, setTab] = useState<Tab>("products");

  const tabs: { key: Tab; label: string }[] = [
    { key: "products", label: `Products (${products.length})` },
    { key: "rate", label: "Exchange Rate" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-1 rounded-xl bg-dark/5 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-dark shadow-sm"
                : "text-dark/50 hover:text-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductList products={products} />}
      {tab === "rate" && <RateManager currentRate={exchangeRate} updatedAt={rateUpdatedAt} />}
    </div>
  );
}
