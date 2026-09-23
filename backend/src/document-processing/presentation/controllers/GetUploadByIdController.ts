import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { BaseController } from "../../../shared/infrastructure/http/BaseController";
import { Container } from "../../infrastructure/dependency-injection/container";
import { GetUploadByIdQuery } from "../../application/queries/objects/GetUploadByIdQuery";
import { UploadNotFoundError } from "../../application/commands/handlers/ProcessFileCommandHandler";
import { UploadDto } from "../../application/dtos/UploadDto";

const paramsSchema = z.object({ id: z.string().uuid() });

export class GetUploadByIdController extends BaseController {
  constructor(private readonly container: Container) {
    super();
  }

  handle = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = paramsSchema.parse(request.params);

    const result = await this.container.queryBus.execute<
      GetUploadByIdQuery,
      UploadNotFoundError,
      UploadDto
    >(new GetUploadByIdQuery(id));

    if (result.isLeft()) {
      GetUploadByIdController.notFound(reply, result.value.message);
      return;
    }

    GetUploadByIdController.ok(reply, result.value);
  };
}
