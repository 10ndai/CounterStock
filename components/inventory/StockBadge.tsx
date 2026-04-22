import { AlertTriangle, CheckCircle } from "lucide-react";
import { formatWeight } from "@/lib/formatters";
import { isLowStock } from "@/lib/utils";

interface Props {
  stockKg: number;
  thresholdKg: number;
}

export function StockBadge({ stockKg, thresholdKg }: Props) {
  const low = isLowStock(stockKg, thresholdKg);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
        low
          ? "bg-alert/10 text-alert"
          : "bg-primary/10 text-primary"
      }`}
    >
      {low ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
      {formatWeight(stockKg)}
    </span>
  );
}
