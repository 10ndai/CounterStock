export interface SessionUser {
  userId: string;
  username: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
}

export function encodeSession(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString("base64url");
}

export function decodeSession(cookie: string | undefined): SessionUser | null {
  if (!cookie) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cookie, "base64url").toString()) as SessionUser;
    if (!parsed.userId || !parsed.username || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}
