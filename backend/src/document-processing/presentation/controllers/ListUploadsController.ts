import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { BaseController } from "../../../shared/infrastructure/http/BaseController";
import { Container } from "../../infrastructure/dependency-injection/container";
import { ListUploadsQuery } from "../../application/queries/objects/ListUploadsQuery";
import { ListUploadsResult } from "../../application/queries/handlers/ListUploadsQueryHandler";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export class ListUploadsController extends BaseController {
  constructor(private readonly container: Container) {
    super();
  }

  handle = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { page, limit } = querySchema.parse(request.query);

    const result = await this.container.queryBus.execute<ListUploadsQuery, never, ListUploadsResult>(
      new ListUploadsQuery(page, limit)
    );

    ListUploadsController.ok(reply, result.value);
  };
}
