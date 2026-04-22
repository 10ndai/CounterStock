import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const product = await prisma.product.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const product = await prisma.product.update({
    where: { id },
    data: { active: false },
  });
  return NextResponse.json(product);
}
