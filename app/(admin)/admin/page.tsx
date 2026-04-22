import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PinGate } from "@/components/admin/PinGate";
import { AdminClient } from "@/components/admin/AdminClient";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.settings.findUnique({ where: { id: "global" } }),
  ]);

  const rate = settings?.usdToZwgRate ?? 35.5;
  const rateUpdatedAt = settings?.updatedAt ?? new Date(0);

  return (
    <PinGate>
      <div className="min-h-screen bg-surface">
        <header className="bg-dark text-surface px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-surface/50 hover:text-surface transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-bold text-lg">Admin Panel</h1>
            <p className="text-xs text-surface/50">Reed &amp; Carter · CounterStock</p>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-6">
          <AdminClient
            products={products as Product[]}
            exchangeRate={rate}
            rateUpdatedAt={rateUpdatedAt}
          />
        </div>
      </div>
    </PinGate>
  );
}
