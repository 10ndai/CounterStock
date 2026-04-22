import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface SaleItemInput {
  productId: string;
  quantity: number;
  unitPriceUSD: number;
  totalUSD: number;
}

interface SaleInput {
  items: SaleItemInput[];
  subtotalUSD: number;
  totalUSD: number;
  paymentCurrency: "USD" | "ZWG";
  exchangeRateUsed: number;
  totalInPaymentCurrency: number;
  paymentMethod: "cash" | "card";
  cashReceived: number | null;
  changeGiven: number | null;
}

export async function POST(request: Request) {
  const body = await request.json() as SaleInput;

  const sale = await prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        subtotalUSD: body.subtotalUSD,
        totalUSD: body.totalUSD,
        paymentCurrency: body.paymentCurrency,
        exchangeRateUsed: body.exchangeRateUsed,
        totalInPaymentCurrency: body.totalInPaymentCurrency,
        paymentMethod: body.paymentMethod,
        cashReceived: body.cashReceived,
        changeGiven: body.changeGiven,
        items: {
          create: body.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceUSD: item.unitPriceUSD,
            totalUSD: item.totalUSD,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of body.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      const kgUsed = product.soldByWeight
        ? item.quantity
        : item.quantity * (product.unitWeightKg ?? 1);

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "sale",
          quantityKg: -kgUsed,
          createdBy: "system",
        },
      });

      await tx.product.update({
        where: { id: item.productId },
        data: { stockKg: { decrement: kgUsed } },
      });
    }

    return newSale;
  });

  return NextResponse.json(sale);
}
