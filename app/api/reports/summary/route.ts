import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where = {
    createdAt: {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    },
  };

  const sales = await prisma.sale.findMany({
    where,
    include: {
      items: {
        include: {
          product: { select: { name: true, category: true, costPricePerKgUSD: true, soldByWeight: true, unitWeightKg: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalTransactions = sales.length;
  const totalUSD = sales.reduce((s, sale) => s + sale.totalUSD, 0);

  const usdSales = sales.filter((s) => s.paymentCurrency === "USD");
  const zwgSales = sales.filter((s) => s.paymentCurrency === "ZWG");
  const cashSales = sales.filter((s) => s.paymentMethod === "cash");
  const cardSales = sales.filter((s) => s.paymentMethod === "card");
  const splitSales = sales.filter((s) => s.paymentMethod === "split");

  // Top products by revenue — with cost data
  const productMap: Record<string, {
    name: string;
    category: string;
    revenueUSD: number;
    quantitySold: number;
    costUSD: number;
    hasCost: boolean;
  }> = {};

  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.productId;
      if (!productMap[key]) {
        productMap[key] = {
          name: item.product.name,
          category: item.product.category,
          revenueUSD: 0,
          quantitySold: 0,
          costUSD: 0,
          hasCost: item.product.costPricePerKgUSD != null,
        };
      }
      productMap[key].revenueUSD += item.totalUSD;
      productMap[key].quantitySold += item.quantity;
      if (item.product.costPricePerKgUSD != null) {
        const kgQty = item.product.soldByWeight
          ? item.quantity
          : item.quantity * (item.product.unitWeightKg ?? 1);
        productMap[key].costUSD += kgQty * item.product.costPricePerKgUSD;
      }
    }
  }

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenueUSD - a.revenueUSD)
    .slice(0, 10);

  const totalCost = topProducts.reduce((s, p) => s + p.costUSD, 0);
  const grossProfit = totalUSD - totalCost;
  const hasCostData = topProducts.some((p) => p.hasCost);

  return NextResponse.json({
    totalTransactions,
    totalUSD,
    usdCount: usdSales.length,
    usdRevenue: usdSales.reduce((s, sale) => s + sale.totalUSD, 0),
    zwgCount: zwgSales.length,
    zwgRevenue: zwgSales.reduce((s, sale) => s + sale.totalUSD, 0),
    cashCount: cashSales.length,
    cashRevenue: cashSales.reduce((s, sale) => s + sale.totalUSD, 0),
    cardCount: cardSales.length,
    cardRevenue: cardSales.reduce((s, sale) => s + sale.totalUSD, 0),
    splitCount: splitSales.length,
    splitRevenue: splitSales.reduce((s, sale) => s + sale.totalUSD, 0),
    grossProfit,
    hasCostData,
    topProducts,
    sales: sales.map((sale) => ({
      id: sale.id,
      createdAt: sale.createdAt,
      totalUSD: sale.totalUSD,
      paymentCurrency: sale.paymentCurrency,
      exchangeRateUsed: sale.exchangeRateUsed,
      totalInPaymentCurrency: sale.totalInPaymentCurrency,
      paymentMethod: sale.paymentMethod,
      itemCount: sale.items.length,
    })),
  });
}
