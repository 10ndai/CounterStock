import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where = {
    userId: { not: null },
    createdAt: {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    },
  };

  const sales = await prisma.sale.findMany({
    where,
    include: { user: { select: { username: true, role: true } } },
  });

  const staffMap: Record<string, { userId: string; username: string; role: string; transactions: number; revenueUSD: number }> = {};

  for (const sale of sales) {
    if (!sale.userId || !sale.user) continue;
    if (!staffMap[sale.userId]) {
      staffMap[sale.userId] = {
        userId: sale.userId,
        username: sale.user.username,
        role: sale.user.role,
        transactions: 0,
        revenueUSD: 0,
      };
    }
    staffMap[sale.userId].transactions += 1;
    staffMap[sale.userId].revenueUSD += sale.totalUSD;
  }

  const staff = Object.values(staffMap).sort((a, b) => b.revenueUSD - a.revenueUSD);
  return NextResponse.json(staff);
}
