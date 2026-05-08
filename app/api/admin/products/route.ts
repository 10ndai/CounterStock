import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { decodeSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { variants: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json(products);
}

interface ProductInput {
  name: string;
  category: string;
  pricePerKgUSD: number;
  pricePerUnitUSD: number | null;
  costPricePerKgUSD: number | null;
  soldByWeight: boolean;
  stockKg: number;
  lowStockThresholdKg: number;
  unitWeightKg: number | null;
  parentId: string | null;
  defaultSupplierId: string | null;
}

export async function POST(request: Request) {
  const store = await cookies();
  const session = decodeSession(store.get("cs_session")?.value);
  const body = await request.json() as ProductInput;

  const product = await prisma.product.create({
    data: {
      name: body.name,
      category: body.category,
      pricePerKgUSD: body.pricePerKgUSD,
      pricePerUnitUSD: body.pricePerUnitUSD ?? null,
      costPricePerKgUSD: body.costPricePerKgUSD ?? null,
      soldByWeight: body.soldByWeight,
      stockKg: body.stockKg ?? 0,
      lowStockThresholdKg: body.lowStockThresholdKg ?? 2,
      unitWeightKg: body.unitWeightKg ?? null,
      parentId: body.parentId ?? null,
      defaultSupplierId: body.defaultSupplierId ?? null,
    },
  });

  if (session) {
    await audit(session.userId, "PRODUCT_CREATE", { name: product.name, category: product.category });
  }

  return NextResponse.json(product);
}
