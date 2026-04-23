"use client";
import { useState, useEffect } from "react";
import { RefreshCw, Printer } from "lucide-react";
import { formatUSD, formatZWG } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

interface CashUpData {
  generatedAt: string;
  totalTransactions: number;
  usdCash: { count: number; totalUSD: number; cashInTill: number; changeGiven: number; netUSD: number };
  zwgCash: { count: number; totalUSD: number; cashInTillZWG: number; changeGivenZWG: number; netZWG: number };
  usdCard: { count: number; totalUSD: number };
  zwgCard: { count: number; totalUSD: number; totalZWG: number };
  splitPayments?: { count: number; totalUSD: number; totalUsdCash: number; totalZwgCash: number };
  grandTotalUSD: number;
}

function Row({ label, value, sub, bold }: { label: string; value: string; sub?: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${bold ? "border-t border-dark/10 mt-1 pt-3" : ""}`}>
      <span className={`text-sm ${bold ? "font-bold text-dark" : "text-dark/70"}`}>{label}</span>
      <div className="text-right">
        <span className={`text-sm ${bold ? "font-bold text-dark" : "font-medium text-dark"}`}>{value}</span>
        {sub && <p className="text-xs text-dark/40">{sub}</p>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dark/10 bg-white p-4">
      <p className="text-xs font-bold text-dark/40 uppercase tracking-wide mb-2">{title}</p>
      {children}
    </div>
  );
}

export function CashUpReport() {
  const [data, setData] = useState<CashUpData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/reports/cashup");
    setData(await res.json() as CashUpData);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handlePrint() { window.print(); }

  if (loading) return <p className="text-sm text-dark/40 text-center py-8">Loading cash-up…</p>;
  if (!data) return null;

  const genTime = new Date(data.generatedAt).toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" });
  const today = new Date().toLocaleDateString("en-ZW", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-dark">{today}</p>
          <p className="text-xs text-dark/40">Generated at {genTime} · {data.totalTransactions} transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer size={13} /> Print
          </Button>
        </div>
      </div>

      {/* USD Cash */}
      <Section title="USD Cash">
        <Row label="Transactions" value={data.usdCash.count.toString()} />
        <Row label="Cash received" value={formatUSD(data.usdCash.cashInTill)} />
        <Row label="Change given" value={`− ${formatUSD(data.usdCash.changeGiven)}`} />
        <Row label="Net USD cash" value={formatUSD(data.usdCash.netUSD)} bold />
      </Section>

      {/* ZWG Cash */}
      <Section title="ZWG Cash">
        <Row label="Transactions" value={data.zwgCash.count.toString()} />
        <Row label="Cash received" value={formatZWG(data.zwgCash.cashInTillZWG)} />
        <Row label="Change given" value={`− ${formatZWG(data.zwgCash.changeGivenZWG)}`} />
        <Row label="Net ZWG cash" value={formatZWG(data.zwgCash.netZWG)} bold />
        <Row label="USD equivalent" value={formatUSD(data.zwgCash.totalUSD)} />
      </Section>

      {/* Split Payments */}
      {data.splitPayments && data.splitPayments.count > 0 && (
        <Section title="Split Payments">
          <Row label="Transactions" value={data.splitPayments.count.toString()} />
          <Row label="USD cash portion" value={formatUSD(data.splitPayments.totalUsdCash)} />
          <Row label="ZWG cash portion" value={formatZWG(data.splitPayments.totalZwgCash)} />
          <Row label="Total USD equivalent" value={formatUSD(data.splitPayments.totalUSD)} bold />
        </Section>
      )}

      {/* Card */}
      <Section title="Card Payments">
        {data.usdCard.count > 0 && (
          <Row label={`USD card (${data.usdCard.count})`} value={formatUSD(data.usdCard.totalUSD)} />
        )}
        {data.zwgCard.count > 0 && (
          <Row label={`ZWG card (${data.zwgCard.count})`} value={formatZWG(data.zwgCard.totalZWG)} sub={formatUSD(data.zwgCard.totalUSD)} />
        )}
        {data.usdCard.count === 0 && data.zwgCard.count === 0 && (
          <p className="text-sm text-dark/40 py-1">No card transactions today.</p>
        )}
      </Section>

      {/* Grand total */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-primary/60 uppercase tracking-wide">Total Revenue</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{formatUSD(data.grandTotalUSD)}</p>
        </div>
        <div className="text-right text-xs text-dark/50">
          <p>{data.totalTransactions} transactions</p>
          <p>USD equivalent</p>
        </div>
      </div>
    </div>
  );
}
