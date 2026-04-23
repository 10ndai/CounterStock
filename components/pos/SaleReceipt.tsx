import { forwardRef } from "react";
import type { CartItem, PaymentCurrency, PaymentMethod } from "@/types";
import { formatUSD, formatZWG, formatWeight } from "@/lib/formatters";

interface SaleData {
  id: string;
  items: CartItem[];
  totalUSD: number;
  paymentCurrency: PaymentCurrency;
  exchangeRateUsed: number;
  totalInPaymentCurrency: number;
  paymentMethod: PaymentMethod;
  cashReceived: number | null;
  changeGiven: number | null;
  splitUsdCash?: number | null;
  splitZwgCash?: number | null;
  createdAt: string;
}

interface Props {
  sale: SaleData;
}

export const SaleReceipt = forwardRef<HTMLDivElement, Props>(({ sale }, ref) => {
  const date = new Date(sale.createdAt);
  const dateStr = date.toLocaleDateString("en-ZW", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      ref={ref}
      style={{ fontFamily: "monospace", fontSize: 12, width: 300, padding: 16, backgroundColor: "#fff", color: "#000" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: "bold", letterSpacing: 2 }}>COUNTERSTOCK</div>
        <div style={{ fontSize: 10, color: "#555" }}>by Reed &amp; Carter</div>
        <div style={{ fontSize: 10, marginTop: 4 }}>{dateStr} {timeStr}</div>
        <div style={{ fontSize: 10, color: "#888" }}>Ref: {sale.id.slice(-8).toUpperCase()}</div>
      </div>

      <div style={{ borderTop: "1px dashed #000", marginBottom: 8 }} />

      {/* Items */}
      {sale.items.map((item) => {
        const qty = item.product.soldByWeight ? formatWeight(item.quantity) : `× ${item.quantity}`;
        return (
          <div key={item.product.id} style={{ marginBottom: 6 }}>
            <div style={{ fontWeight: "bold" }}>{item.product.name}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#555" }}>{qty}</span>
              <span>{formatUSD(item.totalUSD)}</span>
            </div>
          </div>
        );
      })}

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginBottom: 4 }}>
        <span>TOTAL (USD)</span>
        <span>{formatUSD(sale.totalUSD)}</span>
      </div>

      {sale.paymentCurrency === "ZWG" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555" }}>
            <span>Rate: 1 USD = {sale.exchangeRateUsed} ZWG</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>TOTAL (ZWG)</span>
            <span>{formatZWG(sale.totalInPaymentCurrency)}</span>
          </div>
        </>
      )}

      {sale.paymentCurrency === "USD" && sale.exchangeRateUsed > 0 && (
        <div style={{ fontSize: 10, color: "#888" }}>
          Rate: 1 USD = {sale.exchangeRateUsed} ZWG
        </div>
      )}

      <div style={{ marginTop: 6, fontSize: 11 }}>
        {sale.paymentMethod === "split" ? (
          <>
            <div>Paid by: Split payment</div>
            {sale.splitUsdCash != null && sale.splitUsdCash > 0 && (
              <div>USD cash: {formatUSD(sale.splitUsdCash)}</div>
            )}
            {sale.splitZwgCash != null && sale.splitZwgCash > 0 && (
              <div>ZWG cash: {formatZWG(sale.splitZwgCash)}</div>
            )}
          </>
        ) : (
          <>
            <div>Paid by: {sale.paymentMethod === "cash" ? "Cash" : "Card"} ({sale.paymentCurrency})</div>
            {sale.cashReceived !== null && (
              <div>Cash received: {sale.paymentCurrency === "USD" ? formatUSD(sale.cashReceived) : formatZWG(sale.cashReceived)}</div>
            )}
            {sale.changeGiven !== null && sale.changeGiven > 0 && (
              <div>Change: {sale.paymentCurrency === "USD" ? formatUSD(sale.changeGiven) : formatZWG(sale.changeGiven)}</div>
            )}
          </>
        )}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />
      <div style={{ textAlign: "center", fontSize: 10, color: "#888" }}>
        Thank you for your business!
      </div>
    </div>
  );
});
SaleReceipt.displayName = "SaleReceipt";
