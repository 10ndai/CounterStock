import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PinGate } from "@/components/admin/PinGate";
import { ReportsClient } from "@/components/admin/ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "global" } });
  const rate = settings?.usdToZwgRate ?? 35.5;

  return (
    <PinGate>
      <div className="min-h-screen bg-surface">
        <header className="bg-dark text-surface px-6 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-surface/50 hover:text-surface transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-bold text-lg">Reports</h1>
            <p className="text-xs text-surface/50">Sales analytics &amp; exports</p>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <ReportsClient defaultRate={rate} />
        </div>
      </div>
    </PinGate>
  );
}
