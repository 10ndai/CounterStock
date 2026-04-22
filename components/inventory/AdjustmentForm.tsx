"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  products: Product[];
  onDone?: () => void;
}

export function AdjustmentForm({ products, onDone }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [type, setType] = useState<"adjustment" | "wastage">("wastage");
  const [qty, setQty] = useState("");
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
    const res = await fetch("/api/inventory/adjustment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, type, quantityKg: quantity, notes: notes || null }),
    });
    if (!res.ok) { setError("Failed to log adjustment."); return; }
    setQty("");
    setNotes("");
    startTransition(() => { router.refresh(); onDone?.(); });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="adj-product">Product</Label>
        <select
          id="adj-product"
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
        <Label>Type</Label>
        <div className="mt-1 flex gap-3">
          {(["wastage", "adjustment"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${
                type === t
                  ? "border-alert bg-alert/10 text-alert"
                  : "border-dark/20 text-dark hover:bg-dark/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="adj-qty">Quantity removed (kg)</Label>
        <Input
          id="adj-qty"
          type="number"
          min="0.001"
          step="0.001"
          placeholder="e.g. 1.500"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="adj-notes">Notes</Label>
        <Input
          id="adj-notes"
          placeholder="e.g. Expired stock, counting error…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
        />
      </div>
      {error && <p className="text-sm text-alert">{error}</p>}
      <Button type="submit" variant="destructive" className="w-full" disabled={isPending}>
        {isPending ? "Logging…" : "Log Adjustment"}
      </Button>
    </form>
  );
}
