import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma como singleton, compartido entre la API y el worker
 * (cada proceso instancia el suyo al importarlo).
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
