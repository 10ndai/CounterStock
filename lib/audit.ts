import { prisma } from "./db";

export async function audit(
  userId: string,
  action: string,
  detail: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { userId, action, detail: JSON.stringify(detail) },
    });
  } catch {
    // Non-blocking — never let audit failures break the main operation
  }
}
