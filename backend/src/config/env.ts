import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().min(1),

  STORAGE_DRIVER: z.enum(["s3", "local"]).default("s3"),
  MESSAGE_QUEUE_DRIVER: z.enum(["sqs", "mock"]).default("sqs"),

  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().default("test"),
  AWS_SECRET_ACCESS_KEY: z.string().default("test"),
  AWS_ENDPOINT_URL: z.string().optional(),

  S3_BUCKET_NAME: z.string().default("csv-processing-bucket"),
  SQS_QUEUE_URL: z.string().default(""),

  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Tamaño máximo permitido para el archivo CSV subido, en megabytes.
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(1024),
});

export type Env = z.infer<typeof envSchema> & { MAX_UPLOAD_SIZE_BYTES: number };

const parsedEnv = envSchema.parse(process.env);

export const env: Env = {
  ...parsedEnv,
  MAX_UPLOAD_SIZE_BYTES: parsedEnv.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
};
