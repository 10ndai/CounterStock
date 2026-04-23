"use client";
import { useState, useEffect, useCallback } from "react";
import { formatUSD } from "@/lib/formatters";

interface StaffStat {
  userId: string;
  username: string;
  role: string;
  transactions: number;
  revenueUSD: number;
}

type Range = "today" | "yesterday" | "week" | "month";

const RANGES: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "Last 7 Days" },
  { key: "month", label: "This Month" },
];

function getRangeDates(range: Range) {
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
  const m = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: m.toISOString(), to: new Date(today.getTime() + 86400000 - 1).toISOString() };
}

export function StaffReport() {
  const [range, setRange] = useState<Range>("today");
  const [stats, setStats] = useState<StaffStat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { from, to } = getRangeDates(range);
    const res = await fetch(`/api/reports/staff?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    const data = await res.json() as StaffStat[];
    setStats(data);
    setLoading(false);
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
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
      </div>

      {loading && <p className="text-sm text-dark/40 text-center py-4">Loading…</p>}

      {!loading && stats.length === 0 && (
        <p className="text-sm text-dark/40 text-center py-6">No sales recorded in this period.</p>
      )}

      {!loading && stats.length > 0 && (
        <div className="rounded-xl border border-dark/10 overflow-hidden bg-white">
          <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-dark/5 bg-dark/3">
            <p className="text-xs font-bold text-dark/40 uppercase tracking-wide">Staff</p>
            <p className="text-xs font-bold text-dark/40 uppercase tracking-wide">Role</p>
            <p className="text-xs font-bold text-dark/40 uppercase tracking-wide text-right">Transactions</p>
            <p className="text-xs font-bold text-dark/40 uppercase tracking-wide text-right">Revenue</p>
          </div>
          {stats.map((s, idx) => (
            <div
              key={s.userId}
              className={`grid grid-cols-4 gap-2 px-4 py-3 items-center ${idx < stats.length - 1 ? "border-b border-dark/5" : ""}`}
            >
              <p className="text-sm font-semibold text-dark truncate">{s.username}</p>
              <p className="text-xs text-dark/50">{s.role.charAt(0) + s.role.slice(1).toLowerCase()}</p>
              <p className="text-sm text-dark text-right">{s.transactions}</p>
              <p className="text-sm font-medium text-dark text-right">{formatUSD(s.revenueUSD)}</p>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-2 px-4 py-3 border-t border-dark/10 bg-dark/3">
            <p className="text-sm font-bold text-dark col-span-2">Total</p>
            <p className="text-sm font-bold text-dark text-right">
              {stats.reduce((s, r) => s + r.transactions, 0)}
            </p>
            <p className="text-sm font-bold text-dark text-right">
              {formatUSD(stats.reduce((s, r) => s + r.revenueUSD, 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
