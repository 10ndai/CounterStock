import { formatUSD, formatZWG } from "@/lib/formatters";

interface Props {
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
  avgRate: number;
}

function Card({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-secondary/30 bg-secondary/5" : "border-dark/10 bg-white"}`}>
      <p className="text-xs font-medium text-dark/50 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? "text-secondary" : "text-dark"}`}>{value}</p>
      {sub && <p className="text-xs text-dark/40 mt-0.5">{sub}</p>}
    </div>
  );
}

export function SummaryCards({
  totalTransactions,
  totalUSD,
  usdCount,
  usdRevenue,
  zwgCount,
  zwgRevenue,
  cashCount,
  cashRevenue,
  cardCount,
  cardRevenue,
  splitCount = 0,
  splitRevenue = 0,
  grossProfit,
  hasCostData = false,
  avgRate,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card label="Total Sales" value={totalTransactions.toString()} sub="transactions" />
        <Card label="Total Revenue" value={formatUSD(totalUSD)} sub="in USD equivalent" />
      </div>

      {hasCostData && grossProfit !== undefined && (
        <Card
          label="Gross Profit"
          value={formatUSD(grossProfit)}
          sub={`${totalUSD > 0 ? ((grossProfit / totalUSD) * 100).toFixed(1) : "0.0"}% margin`}
          accent
        />
      )}

      <p className="text-xs font-semibold text-dark/40 uppercase tracking-wide pt-1">By Currency</p>
      <div className="grid grid-cols-2 gap-3">
        <Card
          label="USD Sales"
          value={formatUSD(usdRevenue)}
          sub={`${usdCount} transaction${usdCount !== 1 ? "s" : ""}`}
        />
        <Card
          label="ZWG Sales"
          value={formatUSD(zwgRevenue)}
          sub={`${zwgCount} transaction${zwgCount !== 1 ? "s" : ""} · ≈ ${formatZWG(zwgRevenue * avgRate)}`}
        />
      </div>

      <p className="text-xs font-semibold text-dark/40 uppercase tracking-wide pt-1">By Method</p>
      <div className={`grid gap-3 ${splitCount > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
        <Card
          label="Cash"
          value={formatUSD(cashRevenue)}
          sub={`${cashCount} transaction${cashCount !== 1 ? "s" : ""}`}
        />
        <Card
          label="Card"
          value={formatUSD(cardRevenue)}
          sub={`${cardCount} transaction${cardCount !== 1 ? "s" : ""}`}
        />
        {splitCount > 0 && (
          <Card
            label="Split"
            value={formatUSD(splitRevenue)}
            sub={`${splitCount} transaction${splitCount !== 1 ? "s" : ""}`}
          />
        )}
      </div>
    </div>
  );
}
