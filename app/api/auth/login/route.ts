import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { encodeSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function POST(req: Request) {
  const { username, password } = await req.json() as { username: string; password: string };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.active) {
    return NextResponse.json({ ok: false });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ ok: false });
  }

  const session = { userId: user.id, username: user.username, role: user.role as "OWNER" | "MANAGER" | "CASHIER" };
  const token = encodeSession(session);

  await audit(user.id, "LOGIN", { username: user.username, role: user.role });

  const res = NextResponse.json({ ok: true, ...session });
  res.cookies.set("cs_session", token, {
    httpOnly: false, // readable by middleware and JS
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return res;
}
