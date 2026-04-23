"use client";
import { useState, useEffect, useCallback } from "react";
import { Download, FileText } from "lucide-react";
import { SummaryCards } from "./SummaryCards";
import { TopProducts } from "./TopProducts";
import { SalesList } from "./SalesList";
import { CashUpReport } from "./CashUpReport";
import { StaffReport } from "./StaffReport";
import { Button } from "@/components/ui/button";
import { exportSalesCsv, exportProductsCsv } from "@/lib/exportCsv";
import type { UserRole } from "@/types";

type Range = "today" | "yesterday" | "week" | "month" | "custom";

interface ProductStat {
  name: string;
  category: string;
  revenueUSD: number;
  quantitySold: number;
  costUSD?: number;
  hasCost?: boolean;
}

interface ReportData {
  totalTransactions: number;
  totalUSD: number;
  usdCount: number;
  usdRevenue: number;
  zwgCount: number;
  zwgRevenue: number;
  cashCount: number;
  cashRevenue: number;
  cardCount: number;
  cardRevenue: number;
  splitCount?: number;
  splitRevenue?: number;
  grossProfit?: number;
  hasCostData?: boolean;
  topProducts: ProductStat[];
  sales: {
    id: string;
    createdAt: string;
    totalUSD: number;
    paymentCurrency: string;
    exchangeRateUsed: number;
    totalInPaymentCurrency: number;
    paymentMethod: string;
    itemCount: number;
  }[];
}

type Tab = "summary" | "products" | "transactions" | "cashup" | "staff";

function getRangeDates(range: Range, customFrom: string, customTo: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") {
    return { from: today.toISOString(), to: new Date(today.getTime() + 86400000 - 1).toISOString() };
  }
  if (range === "yesterday") {
    const y = new Date(today.getTime() - 86400000);
    return { from: y.toISOString(), to: new Date(today.getTime() - 1).toISOString() };
  }
  if (range === "week") {
    return { from: new Date(today.getTime() - 6 * 86400000).toISOString(), to: new Date(today.getTime() + 86400000 - 1).toISOString() };
  }
  if (range === "month") {
    const m = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: m.toISOString(), to: new Date(today.getTime() + 86400000 - 1).toISOString() };
  }
  return {
    from: customFrom ? new Date(customFrom).toISOString() : today.toISOString(),
    to: customTo ? new Date(new Date(customTo).getTime() + 86400000 - 1).toISOString() : new Date(today.getTime() + 86400000 - 1).toISOString(),
  };
}

const RANGES: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "Last 7 Days" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

async function exportPdf(data: ReportData, dateLabel: string) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("CounterStock — Sales Report", 14, 16);
  doc.setFontSize(10);
  doc.text(`Period: ${dateLabel}`, 14, 24);
  doc.text(`Generated: ${new Date().toLocaleString("en-ZW")}`, 14, 30);
  doc.text(`Total transactions: ${data.totalTransactions}   Revenue: $${data.totalUSD.toFixed(2)}`, 14, 36);

  autoTable(doc, {
    startY: 44,
    head: [["#", "Product", "Category", "Qty Sold", "Revenue (USD)"]],
    body: data.topProducts.map((p, i) => [
      i + 1,
      p.name,
      p.category,
      p.quantitySold.toFixed(3),
      `$${p.revenueUSD.toFixed(2)}`,
    ]),
  });

  doc.save(`counterstock-report-${dateLabel}.pdf`);
}

export function ReportsClient({ defaultRate, role }: { defaultRate: number; role?: UserRole }) {
  const [range, setRange] = useState<Range>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [tab, setTab] = useState<Tab>("summary");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const showStaff = role === "OWNER" || role === "MANAGER";

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { from, to } = getRangeDates(range, customFrom, customTo);
    const res = await fetch(`/api/reports/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    const json = await res.json() as ReportData;
    setData(json);
    setLoading(false);
  }, [range, customFrom, customTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dateLabel = range === "custom" ? `${customFrom}-${customTo}` : range;

  const reportTabs: { key: Tab; label: string }[] = [
    { key: "summary", label: "Summary" },
    { key: "products", label: "Top Products" },
    { key: "transactions", label: `Transactions (${data?.totalTransactions ?? 0})` },
    { key: "cashup", label: "Cash Up" },
    ...(showStaff ? [{ key: "staff" as Tab, label: "Staff" }] : []),
  ];

  return (
    <div className="space-y-5">
      {/* Range selector */}
      <div className="flex flex-wrap gap-2 items-center">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              range === r.key ? "bg-primary text-surface" : "bg-dark/5 text-dark hover:bg-dark/10"
            }`}
          >
            {r.label}
          </button>
        ))}
        {range === "custom" && (
          <div className="flex items-center gap-2 ml-1">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-md border border-dark/20 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-dark/40 text-sm">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-md border border-dark/20 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-dark/40 text-center py-4">Loading…</p>}

      {data && !loading && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-dark/5 p-1 flex-wrap">
            {reportTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors min-w-[80px] ${
                  tab === t.key ? "bg-white text-dark shadow-sm" : "text-dark/50 hover:text-dark"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Export buttons */}
          {tab !== "cashup" && tab !== "staff" && (
            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSalesCsv(data.sales, dateLabel)}
              >
                <Download size={14} /> Sales CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportProductsCsv(data.topProducts, dateLabel)}
              >
                <Download size={14} /> Products CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportPdf(data, dateLabel)}
              >
                <FileText size={14} /> Export PDF
              </Button>
            </div>
          )}

          {tab === "summary" && (
            <SummaryCards
              totalTransactions={data.totalTransactions}
              totalUSD={data.totalUSD}
              usdCount={data.usdCount}
              usdRevenue={data.usdRevenue}
              zwgCount={data.zwgCount}
              zwgRevenue={data.zwgRevenue}
              cashCount={data.cashCount}
              cashRevenue={data.cashRevenue}
              cardCount={data.cardCount}
              cardRevenue={data.cardRevenue}
              splitCount={data.splitCount}
              splitRevenue={data.splitRevenue}
              grossProfit={data.grossProfit}
              hasCostData={data.hasCostData}
              avgRate={defaultRate}
            />
          )}
          {tab === "products" && (
            <TopProducts products={data.topProducts} totalUSD={data.totalUSD} />
          )}
          {tab === "transactions" && <SalesList sales={data.sales} />}
          {tab === "cashup" && <CashUpReport />}
          {tab === "staff" && showStaff && <StaffReport />}
        </>
      )}
    </div>
  );
}
