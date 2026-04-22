import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json() as { username: string; password: string };
  const validUsername = process.env.APP_USERNAME ?? "admin";
  const validPassword = process.env.APP_PASSWORD ?? "counterstock";

  if (username === validUsername && password === validPassword) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false });
}
