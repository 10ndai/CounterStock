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

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, username: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { username, password, role } = await req.json() as {
    username: string;
    password: string;
    role: string;
  };

  if (!username || !password || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, passwordHash: hash, role },
  });

  await audit(session.userId, "USER_CREATE", { newUsername: username, role });

  return NextResponse.json({ id: user.id, username: user.username, role: user.role, active: user.active });
}
