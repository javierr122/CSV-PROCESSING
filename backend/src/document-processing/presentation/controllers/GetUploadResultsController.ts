import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { BaseController } from "../../../shared/infrastructure/http/BaseController";
import { Container } from "../../infrastructure/dependency-injection/container";
import { GetUploadResultsQuery } from "../../application/queries/objects/GetUploadResultsQuery";
import { UploadNotFoundError } from "../../application/commands/handlers/ProcessFileCommandHandler";
import { ActivityDataDto } from "../../application/dtos/UploadDto";

const paramsSchema = z.object({ id: z.string().uuid() });

export class GetUploadResultsController extends BaseController {
  constructor(private readonly container: Container) {
    super();
  }

  handle = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = paramsSchema.parse(request.params);

    const result = await this.container.queryBus.execute<
      GetUploadResultsQuery,
      UploadNotFoundError,
      { data: ActivityDataDto[] }
    >(new GetUploadResultsQuery(id));

    if (result.isLeft()) {
      GetUploadResultsController.notFound(reply, result.value.message);
      return;
    }

    GetUploadResultsController.ok(reply, result.value);
  };
}
