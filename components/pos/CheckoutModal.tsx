"use client";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import type { CartItem, PaymentCurrency, PaymentMethod } from "@/types";
import { formatUSD, formatZWG, convertToZWG, formatWeight } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { SaleReceipt } from "./SaleReceipt";

interface CompletedSale {
  id: string;
  items: CartItem[];
  totalUSD: number;
  paymentCurrency: PaymentCurrency;
  exchangeRateUsed: number;
  totalInPaymentCurrency: number;
  paymentMethod: PaymentMethod;
  cashReceived: number | null;
  changeGiven: number | null;
  createdAt: string;
}

interface Props {
  items: CartItem[];
  totalUSD: number;
  exchangeRate: number;
  onComplete: () => void;
  onClose: () => void;
}

type Step = "currency" | "method" | "cash" | "complete";

export function CheckoutModal({ items, totalUSD, exchangeRate, onComplete, onClose }: Props) {
  const [step, setStep] = useState<Step>("currency");
  const [currency, setCurrency] = useState<PaymentCurrency>("USD");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashInput, setCashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const totalInCurrency = currency === "USD" ? totalUSD : convertToZWG(totalUSD, exchangeRate);
  const cashReceived = parseFloat(cashInput) || 0;
  const change = cashReceived > 0 ? parseFloat((cashReceived - totalInCurrency).toFixed(2)) : 0;

  const handlePrint = useReactToPrint({ content: () => receiptRef.current });

  async function submitSale(cashAmt: number | null) {
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            unitPriceUSD: i.product.soldByWeight
              ? i.product.pricePerKgUSD
              : (i.product.pricePerUnitUSD ?? i.product.pricePerKgUSD),
            totalUSD: i.totalUSD,
          })),
          subtotalUSD: totalUSD,
          totalUSD,
          paymentCurrency: currency,
          exchangeRateUsed: exchangeRate,
          totalInPaymentCurrency: totalInCurrency,
          paymentMethod: method,
          cashReceived: cashAmt,
          changeGiven: cashAmt !== null ? Math.max(0, cashAmt - totalInCurrency) : null,
        }),
      });
      const sale = await res.json() as { id: string; createdAt: string };
      setCompletedSale({
        id: sale.id,
        items,
        totalUSD,
        paymentCurrency: currency,
        exchangeRateUsed: exchangeRate,
        totalInPaymentCurrency: totalInCurrency,
        paymentMethod: method,
        cashReceived: cashAmt,
        changeGiven: cashAmt !== null ? Math.max(0, cashAmt - totalInCurrency) : null,
        createdAt: sale.createdAt,
      });
      setStep("complete");
    } finally {
      setLoading(false);
    }
  }

  const currencySymbol = currency === "USD" ? "$" : "ZWG ";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">

        {/* Step: currency */}
        {step === "currency" && (
          <>
            <h2 className="text-lg font-bold text-dark">Payment Currency</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["USD", "ZWG"] as PaymentCurrency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCurrency(c); setStep("method"); }}
                  className="flex flex-col items-center gap-1 rounded-xl border-2 border-dark/10 py-6 font-bold text-xl text-dark hover:border-primary hover:text-primary transition-colors"
                >
                  {c === "USD" ? "$" : "ZWG"}
                  <span className="text-xs font-normal text-dark/50">{c === "USD" ? "US Dollar" : "Zimbabwe Gold"}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={onClose}>Cancel</Button>
          </>
        )}

        {/* Step: method */}
        {step === "method" && (
          <>
            <h2 className="text-lg font-bold text-dark">Payment Method</h2>
            <p className="text-sm text-dark/50">Total: <strong className="text-dark">{currency === "USD" ? formatUSD(totalUSD) : formatZWG(totalInCurrency)}</strong></p>
            <div className="grid grid-cols-2 gap-3">
              {(["cash", "card"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMethod(m);
                    if (m === "card") submitSale(null);
                    else setStep("cash");
                  }}
                  className="flex flex-col items-center gap-1 rounded-xl border-2 border-dark/10 py-6 font-bold text-lg text-dark hover:border-primary hover:text-primary transition-colors capitalize"
                >
                  {m === "cash" ? "💵" : "💳"}
                  <span className="text-sm">{m}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setStep("currency")}>Back</Button>
          </>
        )}

        {/* Step: cash amount */}
        {step === "cash" && (
          <>
            <h2 className="text-lg font-bold text-dark">Cash Received</h2>
            <div className="rounded-lg bg-dark/5 p-4">
              <p className="text-sm text-dark/60 mb-1">Amount due</p>
              <p className="text-2xl font-bold text-dark">
                {currency === "USD" ? formatUSD(totalInCurrency) : formatZWG(totalInCurrency)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-dark">Cash received ({currency})</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/50 font-medium text-sm">{currencySymbol}</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-dark/20 bg-white pl-10 pr-4 py-3 text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>
            </div>
            {cashReceived > 0 && (
              <div className={`rounded-lg p-3 ${change >= 0 ? "bg-primary/10" : "bg-alert/10"}`}>
                <p className="text-sm font-medium text-dark">
                  Change: <strong className={change >= 0 ? "text-primary" : "text-alert"}>
                    {currency === "USD" ? formatUSD(Math.abs(change)) : formatZWG(Math.abs(change))}
                    {change < 0 ? " (short)" : ""}
                  </strong>
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("method")}>Back</Button>
              <Button
                className="flex-1"
                disabled={cashReceived < totalInCurrency || loading}
                onClick={() => submitSale(cashReceived)}
              >
                {loading ? "Processing…" : "Confirm"}
              </Button>
            </div>
          </>
        )}

        {/* Step: complete */}
        {step === "complete" && completedSale && (
          <>
            <div className="text-center space-y-1">
              <div className="text-4xl">✓</div>
              <h2 className="text-lg font-bold text-dark">Sale Complete</h2>
              {completedSale.changeGiven !== null && completedSale.changeGiven > 0 && (
                <p className="text-sm text-dark/60">
                  Change: <strong>{currency === "USD" ? formatUSD(completedSale.changeGiven) : formatZWG(completedSale.changeGiven)}</strong>
                </p>
              )}
            </div>

            {/* Hidden receipt for printing */}
            <div className="hidden">
              <SaleReceipt ref={receiptRef} sale={completedSale} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => handlePrint()}>Print Receipt</Button>
              <Button className="flex-1" onClick={onComplete}>New Sale</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
