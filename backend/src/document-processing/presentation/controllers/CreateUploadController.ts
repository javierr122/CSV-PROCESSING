import { FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "../../../shared/infrastructure/http/BaseController";
import { Container } from "../../infrastructure/dependency-injection/container";
import { CreateUploadCommand } from "../../application/commands/objects/CreateUploadCommand";
import { UploadDto } from "../../application/dtos/UploadDto";

const DEFAULT_USER_ID = "user-123"; // No se requiere autenticación en esta prueba

export class CreateUploadController extends BaseController {
  constructor(private readonly container: Container) {
    super();
  }

  handle = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const file = await request.file();
    if (!file) {
      CreateUploadController.badRequest(reply, "No se envió ningún archivo");
      return;
    }

    const buffer = await file.toBuffer();
    const command = new CreateUploadCommand(file.filename, buffer, DEFAULT_USER_ID);

    const result = await this.container.commandBus.execute<
      CreateUploadCommand,
      Error,
      UploadDto
    >(command);

    if (result.isLeft()) {
      CreateUploadController.badRequest(reply, result.value.message);
      return;
    }

    CreateUploadController.ok(reply, result.value, 201);
  };
}
