import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { decodeSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

interface Params {
  params: Promise<{ id: string }>;
}

async function getSession() {
  const store = await cookies();
  return decodeSession(store.get("cs_session")?.value);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  const body = await request.json() as Record<string, unknown>;

  const product = await prisma.product.update({ where: { id }, data: body });

  if (session) {
    await audit(session.userId, "PRODUCT_EDIT", { id, name: product.name });
  }

  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getSession();

  const product = await prisma.product.update({
    where: { id },
    data: { active: false },
  });

  if (session) {
    await audit(session.userId, "PRODUCT_DEACTIVATE", { id, name: product.name });
  }

  return NextResponse.json(product);
}
