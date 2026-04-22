import { formatUSD, formatZWG } from "@/lib/formatters";

interface SaleRow {
  id: string;
  createdAt: string;
  totalUSD: number;
  paymentCurrency: string;
  totalInPaymentCurrency: number;
  paymentMethod: string;
  itemCount: number;
}

interface Props {
  sales: SaleRow[];
}

export function SalesList({ sales }: Props) {
  if (sales.length === 0) {
    return <p className="text-sm text-dark/40 py-6 text-center">No transactions in this period.</p>;
  }

  return (
    <div className="rounded-xl border border-dark/10 overflow-hidden bg-white">
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 px-4 py-2 border-b border-dark/5 text-xs font-semibold text-dark/40 uppercase tracking-wide">
        <span>Time</span>
        <span>Ref</span>
        <span className="text-right">Items</span>
        <span className="text-right">Method</span>
        <span className="text-right">Total</span>
      </div>
      {sales.map((sale, idx) => {
        const date = new Date(sale.createdAt);
        const timeStr = date.toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" });
        const isZWG = sale.paymentCurrency === "ZWG";
        return (
          <div
            key={sale.id}
            className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 items-center px-4 py-3 text-sm ${
              idx < sales.length - 1 ? "border-b border-dark/5" : ""
            }`}
          >
            <span className="text-dark/50 text-xs font-mono">{timeStr}</span>
            <span className="text-dark/40 text-xs font-mono truncate">{sale.id.slice(-8).toUpperCase()}</span>
            <span className="text-right text-dark/50">{sale.itemCount}</span>
            <span className={`text-right text-xs font-medium capitalize ${
              sale.paymentMethod === "cash" ? "text-secondary" : "text-primary"
            }`}>
              {sale.paymentMethod}
            </span>
            <div className="text-right">
              <p className="font-semibold text-dark">{formatUSD(sale.totalUSD)}</p>
              {isZWG && (
                <p className="text-[10px] text-dark/40">{formatZWG(sale.totalInPaymentCurrency)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
