"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, PowerOff, Power, Plus } from "lucide-react";
import type { Product } from "@/types";
import { formatUSD, formatWeight } from "@/lib/formatters";
import { ProductForm } from "./ProductForm";
import { Button } from "@/components/ui/button";

interface Props {
  products: Product[];
}

export function ProductList({ products }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);

  async function handleSave(id: string, data: Partial<Product>) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    startTransition(() => router.refresh());
  }

  async function handleAdd(data: Partial<Product>) {
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, stockKg: 0 }),
    });
    setAdding(false);
    startTransition(() => router.refresh());
  }

  async function toggleActive(product: Product) {
    const method = product.active ? "DELETE" : "PATCH";
    const body = product.active ? undefined : JSON.stringify({ active: true });
    await fetch(`/api/admin/products/${product.id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });
    startTransition(() => router.refresh());
  }

  if (adding) {
    return (
      <div className="rounded-xl border border-dark/10 bg-white p-5">
        <h3 className="font-semibold text-dark mb-4">New Product</h3>
        <ProductForm onSave={handleAdd} onCancel={() => setAdding(false)} />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-dark/10 bg-white p-5">
        <h3 className="font-semibold text-dark mb-4">Edit — {editing.name}</h3>
        <ProductForm
          product={editing}
          onSave={(data) => handleSave(editing.id, data)}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={15} /> Add Product
        </Button>
      </div>

      <div className="rounded-xl border border-dark/10 overflow-hidden bg-white">
        {products.map((product, idx) => (
          <div
            key={product.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              idx < products.length - 1 ? "border-b border-dark/5" : ""
            } ${!product.active ? "opacity-50" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-dark truncate">{product.name}</p>
                {!product.active && (
                  <span className="rounded-full bg-dark/10 px-2 py-0.5 text-[10px] text-dark/50 font-medium">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-dark/50">
                {product.category} · {formatUSD(product.pricePerKgUSD)}/kg
                {product.pricePerUnitUSD ? ` · ${formatUSD(product.pricePerUnitUSD)}/unit` : ""}
                {" · "}{formatWeight(product.stockKg)} in stock
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setEditing(product)}
                className="rounded-lg p-2 text-dark/40 hover:bg-dark/5 hover:text-primary transition-colors"
                title="Edit"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => toggleActive(product)}
                className={`rounded-lg p-2 transition-colors ${
                  product.active
                    ? "text-dark/40 hover:bg-alert/10 hover:text-alert"
                    : "text-dark/40 hover:bg-primary/10 hover:text-primary"
                }`}
                title={product.active ? "Deactivate" : "Reactivate"}
              >
                {product.active ? <PowerOff size={15} /> : <Power size={15} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
