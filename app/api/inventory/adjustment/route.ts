import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { decodeSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

interface AdjustmentInput {
  productId: string;
  type: "adjustment" | "wastage";
  quantityKg: number;
  notes: string | null;
}

export async function POST(request: Request) {
  const store = await cookies();
  const session = decodeSession(store.get("cs_session")?.value);
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
        userId: session?.userId ?? null,
      },
    });
    await tx.product.update({
      where: { id: body.productId },
      data: { stockKg: { increment: delta } },
    });
    return m;
  });

  if (session) {
    const product = await prisma.product.findUnique({ where: { id: body.productId }, select: { name: true } });
    await audit(session.userId, "ADJUSTMENT", {
      productId: body.productId,
      productName: product?.name,
      type: body.type,
      quantityKg: body.quantityKg,
    });
  }

  return NextResponse.json(movement);
}
