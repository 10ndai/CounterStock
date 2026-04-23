import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    role?: string;
    password?: string;
    active?: boolean;
  };

  // Prevent owner from deactivating themselves
  if (id === session.userId && body.active === false) {
    return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.role !== undefined) data.role = body.role;
  if (body.active !== undefined) data.active = body.active;
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.update({ where: { id }, data });

  await audit(session.userId, "USER_EDIT", { targetId: id, changes: Object.keys(data) });

  return NextResponse.json({ id: user.id, username: user.username, role: user.role, active: user.active });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (id === session.userId) {
    return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id }, data: { active: false } });

  await audit(session.userId, "USER_DEACTIVATE", { targetId: id });

  return NextResponse.json({ id: user.id, active: user.active });
}
