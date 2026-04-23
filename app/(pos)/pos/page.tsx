import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { decodeSession } from "@/lib/auth";
import { POSTerminal } from "@/components/pos/POSTerminal";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const store = await cookies();
  const session = decodeSession(store.get("cs_session")?.value);

  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, parentId: null },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: {
        variants: {
          where: { active: true },
          orderBy: { name: "asc" },
        },
      },
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
      role={session?.role}
    />
  );
}
