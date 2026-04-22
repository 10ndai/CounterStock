import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { isLowStock, groupByCategory } from "@/lib/utils";
import { StockBadge } from "@/components/inventory/StockBadge";
import { InventoryClient } from "@/components/inventory/InventoryClient";
import type { Product, StockMovement } from "@/types";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [products, movements] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.stockMovement.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const lowStockProducts = products.filter((p) =>
    isLowStock(p.stockKg, p.lowStockThresholdKg)
  );
  const grouped = groupByCategory(products);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-dark text-surface px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-surface/50 hover:text-surface transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-bold text-lg">Inventory</h1>
          <p className="text-xs text-surface/50">{products.length} active products</p>
        </div>
        {lowStockProducts.length > 0 && (
          <span className="ml-auto rounded-full bg-alert px-3 py-1 text-xs font-semibold text-white">
            {lowStockProducts.length} low stock
          </span>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: stock levels table */}
        <section>
          <h2 className="text-sm font-semibold text-dark/60 uppercase tracking-wide mb-4">
            Stock Levels
          </h2>
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-bold text-dark/40 uppercase tracking-widest mb-2">
                  {category}
                </p>
                <div className="rounded-xl border border-dark/10 overflow-hidden bg-white">
                  {items.map((product, idx) => (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between px-4 py-3 ${
                        idx < items.length - 1 ? "border-b border-dark/5" : ""
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-dark">{product.name}</p>
                        <p className="text-xs text-dark/40">
                          Alert at {product.lowStockThresholdKg.toFixed(3)} kg
                        </p>
                      </div>
                      <StockBadge
                        stockKg={product.stockKg}
                        thresholdKg={product.lowStockThresholdKg}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: forms + history */}
        <section>
          <h2 className="text-sm font-semibold text-dark/60 uppercase tracking-wide mb-4">
            Stock Management
          </h2>
          <InventoryClient
            products={products as Product[]}
            movements={movements as (StockMovement & { product: { name: string } })[]}
            lowStockProducts={lowStockProducts as Product[]}
          />
        </section>
      </div>
    </div>
  );
}
