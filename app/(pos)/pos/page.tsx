import { prisma } from "@/lib/db";
import { POSTerminal } from "@/components/pos/POSTerminal";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.settings.findUnique({ where: { id: "global" } }),
  ]);

  const rate = settings?.usdToZwgRate ?? 35.5;
  const rateUpdatedAt = settings?.updatedAt ?? new Date(0);

  return (
    <POSTerminal
      products={products as Product[]}
      exchangeRate={rate}
      rateUpdatedAt={rateUpdatedAt}
    />
  );
}
