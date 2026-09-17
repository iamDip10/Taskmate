import { PrismaClient } from "@prisma/client";

// Standard Next.js-on-serverless pattern: reuse one Prisma client across hot
// reloads / lambda invocations instead of opening a new connection per call.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
