import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { decodeSession } from "@/lib/auth";
import { PinGate } from "@/components/admin/PinGate";
import { ReportsClient } from "@/components/admin/ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const store = await cookies();
  const session = decodeSession(store.get("cs_session")?.value);

  const settings = await prisma.settings.findUnique({ where: { id: "global" } });
  const rate = settings?.usdToZwgRate ?? 35.5;

  return (
    <PinGate>
      <div className="min-h-screen bg-surface">
        <header className="bg-dark text-surface px-6 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-surface/50 hover:text-surface transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <Image src="/logo.png" alt="CounterStock" width={130} height={34} className="object-contain brightness-0 invert" />
          <span className="text-surface/50 text-xs font-medium">Reports</span>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <ReportsClient defaultRate={rate} role={session?.role} />
        </div>
      </div>
    </PinGate>
  );
}
