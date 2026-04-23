import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { decodeSession } from "@/lib/auth";
import { PinGate } from "@/components/admin/PinGate";
import { AdminClient } from "@/components/admin/AdminClient";
import type { Product, Supplier, User } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = await cookies();
  const session = decodeSession(store.get("cs_session")?.value);

  const [products, settings, users, suppliers] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: { variants: { orderBy: { name: "asc" } } },
    }),
    prisma.settings.findUnique({ where: { id: "global" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, username: true, role: true, active: true, createdAt: true },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rate = settings?.usdToZwgRate ?? 35.5;
  const rateUpdatedAt = settings?.updatedAt ?? new Date(0);

  return (
    <PinGate>
      <div className="min-h-screen bg-surface">
        <header className="bg-dark text-surface px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-surface/50 hover:text-surface transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <Image src="/logo.png" alt="CounterStock" width={130} height={34} className="object-contain brightness-0 invert" />
          <span className="text-surface/50 text-xs font-medium">Admin</span>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-6">
          <AdminClient
            products={products as Product[]}
            exchangeRate={rate}
            rateUpdatedAt={rateUpdatedAt}
            users={users as User[]}
            suppliers={suppliers as Supplier[]}
            role={session?.role}
          />
        </div>
      </div>
    </PinGate>
  );
}
