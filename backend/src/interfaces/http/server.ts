import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import multipart from "@fastify/multipart";
import { env } from "../../infrastructure/config/env";
import { Container } from "../../infrastructure/config/container";
import { csvRoutes } from "./routes/csv.routes";
import { registerErrorHandler } from "./plugins/error-handler.plugin";

export async function buildServer(container: Container): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      env.NODE_ENV === "development"
        ? { transport: { target: "pino-pretty" } }
        : true,
  });

  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(sensible);
  await app.register(multipart);

  registerErrorHandler(app);

  app.get("/health", async () => ({ status: "ok" }));

  await csvRoutes(app, container);

  return app;
}
