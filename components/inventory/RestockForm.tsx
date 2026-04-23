"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product, Supplier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  products: Product[];
  suppliers?: Supplier[];
  onDone?: () => void;
}

export function RestockForm({ products, suppliers = [], onDone }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [qty, setQty] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const quantity = parseFloat(qty);
    if (!productId || !quantity || quantity <= 0) {
      setError("Enter a valid product and quantity.");
      return;
    }
    const res = await fetch("/api/inventory/restock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantityKg: quantity,
        supplierId: supplierId || null,
        notes: notes || null,
      }),
    });
    if (!res.ok) { setError("Failed to log restock."); return; }
    setQty("");
    setNotes("");
    setSupplierId("");
    startTransition(() => { router.refresh(); onDone?.(); });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="restock-product">Product</Label>
        <select
          id="restock-product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="mt-1 w-full rounded-md border border-dark/20 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="restock-qty">Quantity (kg)</Label>
        <Input
          id="restock-qty"
          type="number"
          min="0.001"
          step="0.001"
          placeholder="e.g. 10.000"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="mt-1"
        />
      </div>

      {suppliers.length > 0 && (
        <div>
          <Label htmlFor="restock-supplier">Supplier (optional)</Label>
          <select
            id="restock-supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="mt-1 w-full rounded-md border border-dark/20 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— Select supplier —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <Label htmlFor="restock-notes">Notes (optional)</Label>
        <Input
          id="restock-notes"
          placeholder="e.g. Weekly delivery, batch no. 12"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
        />
      </div>

      {error && <p className="text-sm text-alert">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Logging…" : "Log Restock"}
      </Button>
    </form>
  );
}
