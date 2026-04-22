"use client";
import { useState } from "react";
import { Delete } from "lucide-react";
import type { Product } from "@/types";
import { formatUSD, formatWeight } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

interface Props {
  product: Product;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫"];

export function WeightInput({ product, onConfirm, onCancel }: Props) {
  const [value, setValue] = useState("");

  const unitLabel = product.soldByWeight ? "kg" : product.name.includes("Pack") ? "packs" : "units";
  const unitPrice = product.soldByWeight
    ? product.pricePerKgUSD
    : (product.pricePerUnitUSD ?? product.pricePerKgUSD);

  const qty = parseFloat(value) || 0;
  const total = parseFloat((unitPrice * qty).toFixed(2));

  function press(key: string) {
    if (key === "⌫") {
      setValue((v) => v.slice(0, -1));
      return;
    }
    if (key === "." && value.includes(".")) return;
    if (value === "" && key === ".") {
      setValue("0.");
      return;
    }
    const next = value + key;
    if (product.soldByWeight) {
      const parts = next.split(".");
      if (parts[1] && parts[1].length > 3) return;
    } else {
      if (next.includes(".")) return;
    }
    setValue(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-dark">{product.name}</p>
        <p className="text-xs text-dark/50">{formatUSD(unitPrice)} / {product.soldByWeight ? "kg" : "unit"}</p>
      </div>

      {/* Display */}
      <div className="rounded-lg bg-dark/5 p-4 text-right">
        <p className="text-3xl font-bold text-dark tracking-tight">
          {value || "0"} <span className="text-lg font-normal text-dark/50">{unitLabel}</span>
        </p>
        {qty > 0 && (
          <p className="text-sm text-primary font-medium mt-1">= {formatUSD(total)}</p>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => press(key)}
            className={`flex items-center justify-center rounded-lg py-4 text-xl font-semibold transition-colors select-none
              ${key === "⌫"
                ? "bg-alert/10 text-alert hover:bg-alert/20"
                : "bg-dark/5 text-dark hover:bg-dark/10 active:bg-dark/20"
              }`}
          >
            {key === "⌫" ? <Delete size={20} /> : key}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={qty <= 0}
          onClick={() => { if (qty > 0) onConfirm(qty); }}
        >
          Add {qty > 0 ? (product.soldByWeight ? formatWeight(qty) : `× ${qty}`) : ""}
        </Button>
      </div>
    </div>
  );
}
