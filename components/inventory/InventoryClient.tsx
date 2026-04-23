"use client";
import { useState } from "react";
import type { Product, StockMovement, Supplier } from "@/types";
import { RestockForm } from "./RestockForm";
import { AdjustmentForm } from "./AdjustmentForm";
import { MovementHistory } from "./MovementHistory";

interface MovementWithProduct extends StockMovement {
  product: { name: string };
}

interface Props {
  products: Product[];
  movements: MovementWithProduct[];
  lowStockProducts: Product[];
  suppliers?: Supplier[];
}

type Tab = "restock" | "adjustment" | "history";

export function InventoryClient({ products, movements, lowStockProducts, suppliers = [] }: Props) {
  const [tab, setTab] = useState<Tab>("restock");

  const tabs: { key: Tab; label: string }[] = [
    { key: "restock", label: "Log Restock" },
    { key: "adjustment", label: "Log Adjustment" },
    { key: "history", label: `History (${movements.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Low stock alerts */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-xl border border-alert/20 bg-alert/5 p-4">
          <p className="text-sm font-semibold text-alert mb-2">
            Low Stock — {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} need attention
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map((p) => (
              <span key={p.id} className="rounded-md bg-alert/10 px-2.5 py-1 text-xs font-medium text-alert">
                {p.name} — {p.stockKg.toFixed(3)} kg
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
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

      {/* Panel */}
      <div>
        {tab === "restock" && <RestockForm products={products} suppliers={suppliers} />}
        {tab === "adjustment" && <AdjustmentForm products={products} />}
        {tab === "history" && <MovementHistory movements={movements} />}
      </div>
    </div>
  );
}
