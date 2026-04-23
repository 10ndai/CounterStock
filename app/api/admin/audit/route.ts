import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { username: true } } },
  });
  return NextResponse.json(entries);
}
