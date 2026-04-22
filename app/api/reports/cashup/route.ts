import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: todayStart, lte: todayEnd } },
    orderBy: { createdAt: "asc" },
  });

  const usdCash = sales.filter((s) => s.paymentCurrency === "USD" && s.paymentMethod === "cash");
  const zwgCash = sales.filter((s) => s.paymentCurrency === "ZWG" && s.paymentMethod === "cash");
  const usdCard = sales.filter((s) => s.paymentCurrency === "USD" && s.paymentMethod === "card");
  const zwgCard = sales.filter((s) => s.paymentCurrency === "ZWG" && s.paymentMethod === "card");

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalTransactions: sales.length,
    usdCash: {
      count: usdCash.length,
      totalUSD: usdCash.reduce((s, sale) => s + sale.totalUSD, 0),
      cashInTill: usdCash.reduce((s, sale) => s + (sale.cashReceived ?? sale.totalUSD), 0),
      changeGiven: usdCash.reduce((s, sale) => s + (sale.changeGiven ?? 0), 0),
      netUSD: usdCash.reduce((s, sale) => s + sale.totalUSD, 0),
    },
    zwgCash: {
      count: zwgCash.length,
      totalUSD: zwgCash.reduce((s, sale) => s + sale.totalUSD, 0),
      cashInTillZWG: zwgCash.reduce((s, sale) => s + (sale.cashReceived ?? sale.totalInPaymentCurrency), 0),
      changeGivenZWG: zwgCash.reduce((s, sale) => s + (sale.changeGiven ?? 0), 0),
      netZWG: zwgCash.reduce((s, sale) => s + sale.totalInPaymentCurrency, 0),
    },
    usdCard: {
      count: usdCard.length,
      totalUSD: usdCard.reduce((s, sale) => s + sale.totalUSD, 0),
    },
    zwgCard: {
      count: zwgCard.length,
      totalUSD: zwgCard.reduce((s, sale) => s + sale.totalUSD, 0),
      totalZWG: zwgCard.reduce((s, sale) => s + sale.totalInPaymentCurrency, 0),
    },
    grandTotalUSD: sales.reduce((s, sale) => s + sale.totalUSD, 0),
  });
}
