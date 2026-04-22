"use client";
import { useState } from "react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CATEGORIES = ["Beef", "Pork", "Poultry", "Goat", "Processed", "Other"];

interface Props {
  product?: Product;
  onSave: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "Beef");
  const [pricePerKgUSD, setPricePerKgUSD] = useState(product?.pricePerKgUSD.toString() ?? "");
  const [soldByWeight, setSoldByWeight] = useState(product?.soldByWeight ?? true);
  const [pricePerUnitUSD, setPricePerUnitUSD] = useState(product?.pricePerUnitUSD?.toString() ?? "");
  const [unitWeightKg, setUnitWeightKg] = useState(product?.unitWeightKg?.toString() ?? "");
  const [lowStockThresholdKg, setLowStockThresholdKg] = useState(
    product?.lowStockThresholdKg.toString() ?? "2"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Name is required."); return; }
    const priceKg = parseFloat(pricePerKgUSD);
    if (!priceKg || priceKg <= 0) { setError("Price per kg must be a positive number."); return; }

    setSaving(true);
    await onSave({
      name: name.trim(),
      category,
      pricePerKgUSD: priceKg,
      soldByWeight,
      pricePerUnitUSD: !soldByWeight && pricePerUnitUSD ? parseFloat(pricePerUnitUSD) : null,
      unitWeightKg: !soldByWeight && unitWeightKg ? parseFloat(unitWeightKg) : null,
      lowStockThresholdKg: parseFloat(lowStockThresholdKg) || 2,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="pf-name">Product name</Label>
          <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Beef Ribeye" className="mt-1" />
        </div>

        <div>
          <Label htmlFor="pf-cat">Category</Label>
          <select
            id="pf-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-md border border-dark/20 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <Label htmlFor="pf-price">Price per kg (USD)</Label>
          <Input id="pf-price" type="number" min="0.01" step="0.01" value={pricePerKgUSD}
            onChange={(e) => setPricePerKgUSD(e.target.value)} placeholder="0.00" className="mt-1" />
        </div>
      </div>

      {/* Sold by weight toggle */}
      <div>
        <Label>Sold by</Label>
        <div className="mt-1 flex gap-2">
          {[true, false].map((byWeight) => (
            <button
              key={String(byWeight)}
              type="button"
              onClick={() => setSoldByWeight(byWeight)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                soldByWeight === byWeight
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-dark/20 text-dark hover:bg-dark/5"
              }`}
            >
              {byWeight ? "Weight (kg)" : "Unit / Pack"}
            </button>
          ))}
        </div>
      </div>

      {!soldByWeight && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pf-unit-price">Price per unit (USD)</Label>
            <Input id="pf-unit-price" type="number" min="0.01" step="0.01" value={pricePerUnitUSD}
              onChange={(e) => setPricePerUnitUSD(e.target.value)} placeholder="0.00" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="pf-unit-kg">Est. weight per unit (kg)</Label>
            <Input id="pf-unit-kg" type="number" min="0.001" step="0.001" value={unitWeightKg}
              onChange={(e) => setUnitWeightKg(e.target.value)} placeholder="0.500" className="mt-1" />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="pf-threshold">Low stock alert threshold (kg)</Label>
        <Input id="pf-threshold" type="number" min="0.1" step="0.1" value={lowStockThresholdKg}
          onChange={(e) => setLowStockThresholdKg(e.target.value)} className="mt-1" />
      </div>

      {error && <p className="text-sm text-alert">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? "Saving…" : product ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
