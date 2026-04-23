import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { decodeSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

interface RestockInput {
  productId: string;
  quantityKg: number;
  notes: string | null;
  supplierId: string | null;
}

export async function POST(request: Request) {
  const store = await cookies();
  const session = decodeSession(store.get("cs_session")?.value);
  const body = await request.json() as RestockInput;

  const movement = await prisma.$transaction(async (tx) => {
    const m = await tx.stockMovement.create({
      data: {
        productId: body.productId,
        type: "restock",
        quantityKg: Math.abs(body.quantityKg),
        notes: body.notes ?? null,
        createdBy: "admin",
        userId: session?.userId ?? null,
        supplierId: body.supplierId ?? null,
      },
    });
    await tx.product.update({
      where: { id: body.productId },
      data: { stockKg: { increment: Math.abs(body.quantityKg) } },
    });
    return m;
  });

  if (session) {
    const product = await prisma.product.findUnique({ where: { id: body.productId }, select: { name: true } });
    await audit(session.userId, "RESTOCK", {
      productId: body.productId,
      productName: product?.name,
      quantityKg: body.quantityKg,
      supplierId: body.supplierId,
    });
  }

  return NextResponse.json(movement);
}
