import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { pin } = await request.json() as { pin: string };
  const correct = process.env.ADMIN_PIN ?? "1234";
  return NextResponse.json({ ok: pin === correct });
}
