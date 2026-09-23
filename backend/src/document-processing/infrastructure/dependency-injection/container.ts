import { CommandBus } from "../../../shared/application/ICommandBus";
import { QueryBus } from "../../../shared/application/IQueryBus";
import { env } from "../../../config/env";

import { CreateUploadCommandHandler } from "../../application/commands/handlers/CreateUploadCommandHandler";
import { ProcessFileCommandHandler } from "../../application/commands/handlers/ProcessFileCommandHandler";
import { GetUploadByIdQueryHandler } from "../../application/queries/handlers/GetUploadByIdQueryHandler";
import { ListUploadsQueryHandler } from "../../application/queries/handlers/ListUploadsQueryHandler";
import { GetUploadResultsQueryHandler } from "../../application/queries/handlers/GetUploadResultsQueryHandler";
import { CsvParserService } from "../../application/services/CsvParserService";

import { PrismaUploadRepository } from "../persistence/repositories/PrismaUploadRepository";
import { PrismaActivityDataRepository } from "../persistence/repositories/PrismaActivityDataRepository";

import { IFileStorage } from "../storage/IFileStorage";
import { S3FileStorage } from "../storage/S3FileStorage";
import { LocalFileStorage } from "../storage/LocalFileStorage";

import { IMessagePublisher } from "../../../shared/infrastructure/messaging/IMessagePublisher";
import { IMessageConsumer } from "../../../shared/infrastructure/messaging/IMessageConsumer";
import { SqsMessagePublisher } from "../messaging/SqsMessagePublisher";
import { SqsMessageConsumer } from "../messaging/SqsMessageConsumer";
import { MockMessageQueue } from "../messaging/MockMessageQueue";

/**
 * Composition root manual: en lugar de un framework de DI (Awilix),
 * cableamos las dependencias "a mano" en el constructor de cada handler.
 * Es la opción explícitamente aceptada por la prueba técnica cuando no
 * se usa un contenedor de DI de terceros.
 *
 * STORAGE_DRIVER y MESSAGE_QUEUE_DRIVER permiten alternar entre las
 * implementaciones reales (S3/SQS vía LocalStack) y los mocks locales
 * sin tocar el resto del código, gracias a que ambos dependen de las
 * interfaces IFileStorage / IMessagePublisher / IMessageConsumer.
 */
export class Container {
  readonly uploadRepository = new PrismaUploadRepository();
  readonly activityDataRepository = new PrismaActivityDataRepository();

  readonly fileStorage: IFileStorage =
    env.STORAGE_DRIVER === "local" ? new LocalFileStorage() : new S3FileStorage();

  private readonly mockQueue = new MockMessageQueue();

  readonly messagePublisher: IMessagePublisher =
    env.MESSAGE_QUEUE_DRIVER === "mock" ? this.mockQueue : new SqsMessagePublisher();

  readonly messageConsumer: IMessageConsumer =
    env.MESSAGE_QUEUE_DRIVER === "mock" ? this.mockQueue : new SqsMessageConsumer();

  readonly csvParser = new CsvParserService();

  readonly commandBus = new CommandBus();
  readonly queryBus = new QueryBus();

  constructor() {
    this.commandBus.register(
      "CreateUploadCommand",
      new CreateUploadCommandHandler(this.uploadRepository, this.fileStorage, this.messagePublisher)
    );
    this.commandBus.register(
      "ProcessFileCommand",
      new ProcessFileCommandHandler(
        this.uploadRepository,
        this.activityDataRepository,
        this.fileStorage,
        this.csvParser
      )
    );

    this.queryBus.register("GetUploadByIdQuery", new GetUploadByIdQueryHandler(this.uploadRepository));
    this.queryBus.register("ListUploadsQuery", new ListUploadsQueryHandler(this.uploadRepository));
    this.queryBus.register(
      "GetUploadResultsQuery",
      new GetUploadResultsQueryHandler(this.uploadRepository, this.activityDataRepository)
    );
  }

  async bootstrapInfra(): Promise<void> {
    if (this.fileStorage instanceof S3FileStorage) {
      await this.fileStorage.ensureBucketExists();
    }
    if (this.messagePublisher instanceof SqsMessagePublisher) {
      await this.messagePublisher.ensureQueueExists("file-processing-queue");
    }
  }
}

export const container = new Container();
