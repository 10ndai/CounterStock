import { formatUSD } from "@/lib/formatters";

interface ProductStat {
  name: string;
  category: string;
  revenueUSD: number;
  quantitySold: number;
}

interface Props {
  products: ProductStat[];
  totalUSD: number;
}

export function TopProducts({ products, totalUSD }: Props) {
  if (products.length === 0) {
    return <p className="text-sm text-dark/40 py-6 text-center">No sales in this period.</p>;
  }

  const max = products[0].revenueUSD;

  return (
    <div className="space-y-2">
      {products.map((p, idx) => {
        const pct = totalUSD > 0 ? (p.revenueUSD / totalUSD) * 100 : 0;
        const barWidth = max > 0 ? (p.revenueUSD / max) * 100 : 0;
        return (
          <div key={p.name} className="rounded-lg bg-white border border-dark/8 px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-dark/30 w-4">{idx + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-dark">{p.name}</p>
                  <p className="text-xs text-dark/40">{p.category} · {p.quantitySold.toFixed(3)} sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-dark">{formatUSD(p.revenueUSD)}</p>
                <p className="text-xs text-dark/40">{pct.toFixed(1)}% of total</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-dark/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary transition-all"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
