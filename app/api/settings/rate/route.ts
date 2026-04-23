import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { decodeSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: "global" } });
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const store = await cookies();
  const session = decodeSession(store.get("cs_session")?.value);
  const { rate } = await req.json() as { rate: number };

  const old = await prisma.settings.findUnique({ where: { id: "global" } });

  const settings = await prisma.settings.upsert({
    where: { id: "global" },
    update: { usdToZwgRate: rate },
    create: { id: "global", usdToZwgRate: rate },
  });

  if (session) {
    await audit(session.userId, "RATE_UPDATE", { oldRate: old?.usdToZwgRate, newRate: rate });
  }

  return NextResponse.json(settings);
}
