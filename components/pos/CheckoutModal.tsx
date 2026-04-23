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
  splitUsdCash: number | null;
  splitZwgCash: number | null;
  createdAt: string;
}

interface Props {
  items: CartItem[];
  totalUSD: number;
  exchangeRate: number;
  onComplete: () => void;
  onClose: () => void;
}

type Step = "currency" | "method" | "cash" | "split" | "complete";

export function CheckoutModal({ items, totalUSD, exchangeRate, onComplete, onClose }: Props) {
  const [step, setStep] = useState<Step>("currency");
  const [currency, setCurrency] = useState<PaymentCurrency>("USD");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashInput, setCashInput] = useState("");
  const [splitUsd, setSplitUsd] = useState("");
  const [splitZwg, setSplitZwg] = useState("");
  const [loading, setLoading] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const totalInCurrency = currency === "USD" ? totalUSD : convertToZWG(totalUSD, exchangeRate);
  const cashReceived = parseFloat(cashInput) || 0;
  const change = cashReceived > 0 ? parseFloat((cashReceived - totalInCurrency).toFixed(2)) : 0;

  const splitUsdAmt = parseFloat(splitUsd) || 0;
  const splitZwgAmt = parseFloat(splitZwg) || 0;
  const splitTotalUSD = splitUsdAmt + splitZwgAmt / (exchangeRate || 1);
  const splitShort = parseFloat((totalUSD - splitTotalUSD).toFixed(2));

  const handlePrint = useReactToPrint({ content: () => receiptRef.current });

  async function submitSale(opts: {
    cashAmt?: number | null;
    splitUsdCash?: number;
    splitZwgCash?: number;
  }) {
    setLoading(true);
    try {
      const isSplit = method === "split";
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
          paymentCurrency: isSplit ? "USD" : currency,
          exchangeRateUsed: exchangeRate,
          totalInPaymentCurrency: isSplit ? totalUSD : totalInCurrency,
          paymentMethod: method,
          cashReceived: opts.cashAmt ?? null,
          changeGiven: opts.cashAmt != null ? Math.max(0, opts.cashAmt - totalInCurrency) : null,
          splitUsdCash: opts.splitUsdCash ?? null,
          splitZwgCash: opts.splitZwgCash ?? null,
        }),
      });
      const sale = await res.json() as { id: string; createdAt: string };
      setCompletedSale({
        id: sale.id,
        items,
        totalUSD,
        paymentCurrency: isSplit ? "USD" : currency,
        exchangeRateUsed: exchangeRate,
        totalInPaymentCurrency: isSplit ? totalUSD : totalInCurrency,
        paymentMethod: method,
        cashReceived: opts.cashAmt ?? null,
        changeGiven: opts.cashAmt != null ? Math.max(0, opts.cashAmt - totalInCurrency) : null,
        splitUsdCash: opts.splitUsdCash ?? null,
        splitZwgCash: opts.splitZwgCash ?? null,
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
            <p className="text-sm text-dark/50">
              Total: <strong className="text-dark">{currency === "USD" ? formatUSD(totalUSD) : formatZWG(totalInCurrency)}</strong>
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(["cash", "card", "split"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMethod(m);
                    if (m === "card") submitSale({ cashAmt: null });
                    else if (m === "cash") setStep("cash");
                    else setStep("split");
                  }}
                  className="flex flex-col items-center gap-1 rounded-xl border-2 border-dark/10 py-5 font-bold text-base text-dark hover:border-primary hover:text-primary transition-colors"
                >
                  {m === "cash" ? "💵" : m === "card" ? "💳" : "✂️"}
                  <span className="text-xs font-medium capitalize">{m}</span>
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/50 font-medium text-sm">
                  {currencySymbol}
                </span>
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
                  Change:{" "}
                  <strong className={change >= 0 ? "text-primary" : "text-alert"}>
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
                onClick={() => submitSale({ cashAmt: cashReceived })}
              >
                {loading ? "Processing…" : "Confirm"}
              </Button>
            </div>
          </>
        )}

        {/* Step: split payment */}
        {step === "split" && (
          <>
            <h2 className="text-lg font-bold text-dark">Split Payment</h2>
            <div className="rounded-lg bg-dark/5 p-3">
              <p className="text-sm text-dark/60">Total due</p>
              <p className="text-xl font-bold text-dark">{formatUSD(totalUSD)}</p>
              <p className="text-xs text-dark/40 mt-0.5">Rate: 1 USD = {exchangeRate} ZWG</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-dark">USD cash ($)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={splitUsd}
                  onChange={(e) => setSplitUsd(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-md border border-dark/20 bg-white px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark">ZWG cash (ZWG)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={splitZwg}
                  onChange={(e) => setSplitZwg(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-md border border-dark/20 bg-white px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            {(splitUsdAmt > 0 || splitZwgAmt > 0) && (
              <div className={`rounded-lg p-3 ${splitShort <= 0 ? "bg-primary/10" : "bg-alert/10"}`}>
                <p className="text-sm font-medium text-dark">
                  {splitShort <= 0
                    ? <span className="text-primary">Covered — proceed when ready</span>
                    : <span className="text-alert">Still short: {formatUSD(splitShort)}</span>
                  }
                </p>
                <p className="text-xs text-dark/50 mt-0.5">
                  USD {formatUSD(splitUsdAmt)} + ZWG {formatZWG(splitZwgAmt)} = {formatUSD(splitTotalUSD)} USD equivalent
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("method")}>Back</Button>
              <Button
                className="flex-1"
                disabled={splitShort > 0.005 || loading || (splitUsdAmt === 0 && splitZwgAmt === 0)}
                onClick={() => submitSale({ splitUsdCash: splitUsdAmt, splitZwgCash: splitZwgAmt })}
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
              {completedSale.paymentMethod === "split" && (
                <p className="text-sm text-dark/60">
                  {formatUSD(completedSale.splitUsdCash ?? 0)} USD + {formatZWG(completedSale.splitZwgCash ?? 0)} ZWG
                </p>
              )}
              {completedSale.changeGiven !== null && completedSale.changeGiven > 0 && (
                <p className="text-sm text-dark/60">
                  Change: <strong>{currency === "USD" ? formatUSD(completedSale.changeGiven) : formatZWG(completedSale.changeGiven)}</strong>
                </p>
              )}
            </div>

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
