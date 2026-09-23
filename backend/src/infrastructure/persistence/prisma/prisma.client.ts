import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma como singleton para evitar agotar el pool de conexiones
 * en desarrollo (hot-reload) y en el worker.
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
