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
  avgRate: number;
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-dark/10 bg-white p-4">
      <p className="text-xs font-medium text-dark/50 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-dark mt-1">{value}</p>
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
  avgRate,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card label="Total Sales" value={totalTransactions.toString()} sub="transactions" />
        <Card label="Total Revenue" value={formatUSD(totalUSD)} sub="in USD equivalent" />
      </div>

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
      <div className="grid grid-cols-2 gap-3">
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
      </div>
    </div>
  );
}
