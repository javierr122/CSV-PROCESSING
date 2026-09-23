import { z } from "zod";

export const listCsvFilesQuerySchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const csvFileParamsSchema = z.object({
  id: z.string().uuid(),
});
