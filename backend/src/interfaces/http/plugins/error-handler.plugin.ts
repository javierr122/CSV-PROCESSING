import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { DomainError, NotFoundError } from "../../../domain/shared/errors/domain-error";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({
        message: "Datos de entrada inválidos",
        issues: error.issues,
      });
      return;
    }

    if (error instanceof NotFoundError) {
      reply.code(404).send({ message: error.message });
      return;
    }

    if (error instanceof DomainError) {
      reply.code(422).send({ message: error.message });
      return;
    }

    app.log.error(error);
    reply.code(500).send({ message: "Error interno del servidor" });
  });
}
