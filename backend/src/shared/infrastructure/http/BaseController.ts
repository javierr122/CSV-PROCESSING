import { FastifyReply } from "fastify";

/**
 * Helpers comunes de respuesta HTTP, para no repetir status codes
 * "a mano" en cada controller.
 */
export abstract class BaseController {
  protected static ok(reply: FastifyReply, data: unknown, statusCode = 200): void {
    reply.code(statusCode).send(data);
  }

  protected static badRequest(reply: FastifyReply, message: string): void {
    reply.code(400).send({ message });
  }

  protected static notFound(reply: FastifyReply, message: string): void {
    reply.code(404).send({ message });
  }

  protected static unprocessable(reply: FastifyReply, message: string): void {
    reply.code(422).send({ message });
  }

  protected static serverError(reply: FastifyReply, message = "Error interno del servidor"): void {
    reply.code(500).send({ message });
  }
}
