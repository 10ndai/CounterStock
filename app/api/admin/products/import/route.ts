import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { decodeSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

const VALID_CATEGORIES = ["Beef", "Pork", "Poultry", "Goat", "Processed", "Other"];

interface CsvRow {
  name: string;
  category: string;
  pricePerKgUSD: string;
  soldByWeight: string;
  pricePerUnitUSD: string;
  unitWeightKg: string;
  lowStockThresholdKg: string;
}

export async function POST(req: Request) {
  const store = await cookies();
  const session = decodeSession(store.get("cs_session")?.value);

  const rows = await req.json() as CsvRow[];

  const created: string[] = [];
  const skipped: { row: number; reason: string }[] = [];

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      if (!row.name?.trim()) { skipped.push({ row: rowNum, reason: "Missing name" }); continue; }
      if (!VALID_CATEGORIES.includes(row.category)) { skipped.push({ row: rowNum, reason: `Invalid category: ${row.category}` }); continue; }

      const pricePerKg = parseFloat(row.pricePerKgUSD);
      if (!pricePerKg || pricePerKg <= 0) { skipped.push({ row: rowNum, reason: "Invalid pricePerKgUSD" }); continue; }

      const soldByWeight = row.soldByWeight?.toLowerCase() !== "false" && row.soldByWeight !== "0";
      const pricePerUnit = row.pricePerUnitUSD ? parseFloat(row.pricePerUnitUSD) : null;
      const unitWeight = row.unitWeightKg ? parseFloat(row.unitWeightKg) : null;
      const threshold = row.lowStockThresholdKg ? parseFloat(row.lowStockThresholdKg) : 2;

      if (isNaN(threshold) || threshold < 0) { skipped.push({ row: rowNum, reason: "Invalid lowStockThresholdKg" }); continue; }

      await tx.product.create({
        data: {
          name: row.name.trim(),
          category: row.category,
          pricePerKgUSD: pricePerKg,
          soldByWeight,
          pricePerUnitUSD: pricePerUnit && !isNaN(pricePerUnit) ? pricePerUnit : null,
          unitWeightKg: unitWeight && !isNaN(unitWeight) ? unitWeight : null,
          lowStockThresholdKg: threshold,
        },
      });
      created.push(row.name.trim());
    }
  });

  if (session) {
    await audit(session.userId, "PRODUCT_CSV_IMPORT", { created: created.length, skipped: skipped.length });
  }

  return NextResponse.json({ created: created.length, skipped });
}
