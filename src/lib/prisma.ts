import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function makePrisma() {
  // Strip sslmode query param and pass ssl option directly to pg to silence
  // the pg-connection-string future-behavior warning about sslmode=require.
  // Neon has valid TLS certs so rejectUnauthorized:true is correct in prod.
  const rawUrl = process.env.DATABASE_URL ?? "";
  const isRemote =
    rawUrl.includes(".neon.tech") || rawUrl.includes(".supabase.co");
  const connectionString = rawUrl
    .replace(/[?&]sslmode=[^&]*/g, "")
    .replace(/\?$/, "")
    .replace(/&$/, "");

  const adapter = new PrismaPg({
    connectionString,
    ssl: isRemote ? { rejectUnauthorized: true } : false,
    connectionTimeoutMillis: 5000,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

type PrismaClientSingleton = ReturnType<typeof makePrisma>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
