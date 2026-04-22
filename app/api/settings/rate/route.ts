import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: "global" } });
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const { rate } = await request.json() as { rate: number };
  const settings = await prisma.settings.upsert({
    where: { id: "global" },
    update: { usdToZwgRate: rate },
    create: { id: "global", usdToZwgRate: rate },
  });
  return NextResponse.json(settings);
}
