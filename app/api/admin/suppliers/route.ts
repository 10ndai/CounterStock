import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { decodeSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

async function getSession() {
  const store = await cookies();
  return decodeSession(store.get("cs_session")?.value);
}

export async function GET() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
  const session = await getSession();
  const { name, contactNumber, notes } = await req.json() as {
    name: string;
    contactNumber?: string;
    notes?: string;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.create({
    data: {
      name: name.trim(),
      contactNumber: contactNumber?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  if (session) await audit(session.userId, "SUPPLIER_CREATE", { name: supplier.name });

  return NextResponse.json(supplier);
}
