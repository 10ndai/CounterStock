import { ArrowDownCircle, ArrowUpCircle, ShoppingBag, Wrench } from "lucide-react";
import { formatWeight } from "@/lib/formatters";

interface Movement {
  id: string;
  productId: string;
  type: string;
  quantityKg: number;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  product: { name: string };
}

interface Props {
  movements: Movement[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  sale: { label: "Sale", icon: <ShoppingBag size={14} />, color: "text-primary" },
  restock: { label: "Restock", icon: <ArrowUpCircle size={14} />, color: "text-secondary" },
  adjustment: { label: "Adjustment", icon: <Wrench size={14} />, color: "text-alert" },
  wastage: { label: "Wastage", icon: <ArrowDownCircle size={14} />, color: "text-alert" },
};

export function MovementHistory({ movements }: Props) {
  if (movements.length === 0) {
    return <p className="text-sm text-dark/40 py-4 text-center">No movements recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {movements.map((m) => {
        const cfg = TYPE_CONFIG[m.type] ?? { label: m.type, icon: null, color: "text-dark" };
        const date = new Date(m.createdAt);
        const dateStr = date.toLocaleDateString("en-ZW", { day: "2-digit", month: "short" });
        const timeStr = date.toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" });

        return (
          <div key={m.id} className="flex items-center gap-3 rounded-lg bg-white border border-dark/8 px-4 py-3">
            <span className={`shrink-0 ${cfg.color}`}>{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark truncate">{m.product.name}</p>
              {m.notes && <p className="text-xs text-dark/50 truncate">{m.notes}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold ${m.quantityKg > 0 ? "text-primary" : "text-alert"}`}>
                {m.quantityKg > 0 ? "+" : ""}{formatWeight(Math.abs(m.quantityKg))}
              </p>
              <p className="text-[11px] text-dark/40">{dateStr} {timeStr}</p>
            </div>
            <span className={`hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full bg-dark/5 ${cfg.color} shrink-0`}>
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
