import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(products);
}

interface ProductInput {
  name: string;
  category: string;
  pricePerKgUSD: number;
  pricePerUnitUSD: number | null;
  soldByWeight: boolean;
  stockKg: number;
  lowStockThresholdKg: number;
  unitWeightKg: number | null;
}

export async function POST(request: Request) {
  const body = await request.json() as ProductInput;
  const product = await prisma.product.create({
    data: {
      name: body.name,
      category: body.category,
      pricePerKgUSD: body.pricePerKgUSD,
      pricePerUnitUSD: body.pricePerUnitUSD ?? null,
      soldByWeight: body.soldByWeight,
      stockKg: body.stockKg ?? 0,
      lowStockThresholdKg: body.lowStockThresholdKg ?? 2,
      unitWeightKg: body.unitWeightKg ?? null,
    },
  });
  return NextResponse.json(product);
}
