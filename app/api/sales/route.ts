import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { decodeSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

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
  paymentMethod: "cash" | "card" | "split";
  cashReceived: number | null;
  changeGiven: number | null;
  splitUsdCash: number | null;
  splitZwgCash: number | null;
}

export async function POST(request: Request) {
  const store = await cookies();
  const session = decodeSession(store.get("cs_session")?.value);
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
        splitUsdCash: body.splitUsdCash ?? null,
        splitZwgCash: body.splitZwgCash ?? null,
        userId: session?.userId ?? null,
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
          userId: session?.userId ?? null,
        },
      });

      await tx.product.update({
        where: { id: item.productId },
        data: { stockKg: { decrement: kgUsed } },
      });
    }

    return newSale;
  });

  if (session) {
    await audit(session.userId, "SALE", { saleId: sale.id, totalUSD: body.totalUSD, method: body.paymentMethod });
  }

  return NextResponse.json(sale);
}
