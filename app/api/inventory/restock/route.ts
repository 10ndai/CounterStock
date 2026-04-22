import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RestockInput {
  productId: string;
  quantityKg: number;
  notes: string | null;
}

export async function POST(request: Request) {
  const body = await request.json() as RestockInput;

  const movement = await prisma.$transaction(async (tx) => {
    const m = await tx.stockMovement.create({
      data: {
        productId: body.productId,
        type: "restock",
        quantityKg: Math.abs(body.quantityKg),
        notes: body.notes ?? null,
        createdBy: "admin",
      },
    });
    await tx.product.update({
      where: { id: body.productId },
      data: { stockKg: { increment: Math.abs(body.quantityKg) } },
    });
    return m;
  });

  return NextResponse.json(movement);
}
