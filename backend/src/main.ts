import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import multipart from "@fastify/multipart";
import { env } from "./config/env";
import { container } from "./document-processing/infrastructure/dependency-injection/container";
import { documentProcessingRoutes } from "./document-processing/presentation/routes/document-processing.routes";
import { registerErrorHandler } from "./shared/infrastructure/http/error-handler.plugin";

async function bootstrap(): Promise<void> {
  await container.bootstrapInfra();

  const app = Fastify({
    logger: env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : true,
    bodyLimit: env.MAX_UPLOAD_SIZE_BYTES,
  });

  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(sensible);
  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_UPLOAD_SIZE_BYTES,
    },
  });

  registerErrorHandler(app);

  app.get("/health", async () => ({ status: "ok" }));

  await documentProcessingRoutes(app, container);

  await app.listen({ port: env.PORT, host: env.HOST });
  console.log(`CSV-PROCESING backend escuchando en http://${env.HOST}:${env.PORT}`);
}

bootstrap().catch((error) => {
  console.error("Error al iniciar el servidor:", error);
  process.exit(1);
});
