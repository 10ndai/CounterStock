"use client";
import { useState, useEffect } from "react";

interface AuditEntry {
  id: string;
  action: string;
  detail: string;
  createdAt: string;
  user: { username: string };
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Logged in",
  PRODUCT_CREATE: "Product created",
  PRODUCT_EDIT: "Product edited",
  PRODUCT_DEACTIVATE: "Product deactivated",
  RESTOCK: "Restock logged",
  ADJUSTMENT: "Stock adjusted",
  RATE_UPDATE: "Exchange rate updated",
  USER_CREATE: "User created",
  USER_EDIT: "User edited",
  USER_DEACTIVATE: "User deactivated",
  SUPPLIER_CREATE: "Supplier added",
};

export function AuditLogView() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data as AuditEntry[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-dark/40 text-center py-8">Loading…</p>;
  if (entries.length === 0) return <p className="text-sm text-dark/40 text-center py-8">No audit entries yet.</p>;

  return (
    <div className="space-y-1.5">
      {entries.map((e) => {
        const dt = new Date(e.createdAt);
        const date = dt.toLocaleDateString("en-ZW", { day: "2-digit", month: "short" });
        const time = dt.toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" });
        let detail: Record<string, unknown> = {};
        try { detail = JSON.parse(e.detail) as Record<string, unknown>; } catch { /* no-op */ }

        return (
          <div
            key={e.id}
            className="flex items-start gap-3 rounded-lg bg-white border border-dark/8 px-4 py-3"
          >
            <div className="shrink-0 text-right w-12">
              <p className="text-xs font-medium text-dark/60">{date}</p>
              <p className="text-xs text-dark/40">{time}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark">
                {ACTION_LABELS[e.action] ?? e.action}
              </p>
              <p className="text-xs text-dark/50">by {e.user?.username ?? "unknown"}</p>
              {Object.keys(detail).length > 0 && (
                <p className="text-xs text-dark/40 mt-0.5 truncate">
                  {Object.entries(detail)
                    .map(([k, v]) => `${k}: ${String(v)}`)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
