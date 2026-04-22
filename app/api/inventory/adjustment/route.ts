import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface AdjustmentInput {
  productId: string;
  type: "adjustment" | "wastage";
  quantityKg: number;
  notes: string | null;
}

export async function POST(request: Request) {
  const body = await request.json() as AdjustmentInput;
  const delta = -Math.abs(body.quantityKg);

  const movement = await prisma.$transaction(async (tx) => {
    const m = await tx.stockMovement.create({
      data: {
        productId: body.productId,
        type: body.type,
        quantityKg: delta,
        notes: body.notes ?? null,
        createdBy: "admin",
      },
    });
    await tx.product.update({
      where: { id: body.productId },
      data: { stockKg: { increment: delta } },
    });
    return m;
  });

  return NextResponse.json(movement);
}
