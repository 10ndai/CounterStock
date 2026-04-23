import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { decodeSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

async function getSession() {
  const store = await cookies();
  return decodeSession(store.get("cs_session")?.value);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const body = await req.json() as {
    name?: string;
    contactNumber?: string | null;
    notes?: string | null;
    active?: boolean;
  };

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.contactNumber !== undefined && { contactNumber: body.contactNumber || null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
      ...(body.active !== undefined && { active: body.active }),
    },
  });

  if (session) await audit(session.userId, "SUPPLIER_EDIT", { id, name: supplier.name });

  return NextResponse.json(supplier);
}
