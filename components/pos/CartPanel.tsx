"use client";
import { Trash2, ShoppingCart } from "lucide-react";
import { useSaleCart } from "@/hooks/useSaleCart";
import { formatUSD, formatZWG, convertToZWG, formatWeight } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  exchangeRate: number;
  onCheckout: () => void;
}

export function CartPanel({ exchangeRate, onCheckout }: Props) {
  const { items, removeItem, totalUSD } = useSaleCart();
  const zwgTotal = convertToZWG(totalUSD, exchangeRate);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-dark/30">
        <ShoppingCart size={48} strokeWidth={1.5} />
        <p className="text-sm font-medium">Cart is empty</p>
        <p className="text-xs">Tap a product to add it</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {items.map((item) => {
          const label = item.product.soldByWeight
            ? formatWeight(item.quantity)
            : `× ${item.quantity}`;
          return (
            <div key={item.product.id} className="flex items-center gap-3 rounded-lg bg-white p-3 border border-dark/8">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dark truncate">{item.product.name}</p>
                <p className="text-xs text-dark/50">{label}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-dark">{formatUSD(item.totalUSD)}</p>
              </div>
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-alert/60 hover:text-alert transition-colors ml-1"
                aria-label="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-dark/60">Subtotal</span>
          <span className="text-sm font-semibold text-dark">{formatUSD(totalUSD)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-dark/40">≈ ZWG (@ {exchangeRate})</span>
          <span className="text-xs text-dark/40">{formatZWG(zwgTotal)}</span>
        </div>
      </div>

      <Button size="xl" className="w-full text-base font-bold" onClick={onCheckout}>
        Checkout — {formatUSD(totalUSD)}
      </Button>
    </div>
  );
}
