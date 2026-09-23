import { FastifyInstance } from "fastify";
import { ZodError } from "zod";

/**
 * Middleware de manejo de errores centralizado. Los Command/Query Handlers
 * ya no lanzan excepciones de negocio (usan Either), así que lo que llega
 * aquí son errores de validación de entrada (Zod) o errores inesperados.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({ message: "Datos de entrada inválidos", issues: error.issues });
      return;
    }

    app.log.error(error);
    reply.code(500).send({ message: "Error interno del servidor" });
  });
}
