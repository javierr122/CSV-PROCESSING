import { CommandBus } from "../../application/cqrs/command-bus";
import { QueryBus } from "../../application/cqrs/query-bus";

import { UploadCsvHandler } from "../../application/commands/upload-csv/upload-csv.handler";
import { ProcessCsvHandler } from "../../application/commands/process-csv/process-csv.handler";
import { GetCsvFileHandler } from "../../application/queries/get-csv-file/get-csv-file.handler";
import { ListCsvFilesHandler } from "../../application/queries/list-csv-files/list-csv-files.handler";

import { PrismaCsvFileRepository } from "../persistence/prisma/prisma-csv-file.repository";
import { S3StorageAdapter } from "../storage/s3-storage.adapter";
import { SqsMessageQueueAdapter } from "../messaging/sqs-message-queue.adapter";
import { CsvParserAdapter } from "../parsers/csv-parser.adapter";

/**
 * Composition root manual (sin framework de DI): cablea los adaptadores de
 * infraestructura a los puertos de la capa de aplicación y registra los
 * handlers de comandos/queries en sus respectivos buses.
 */
export class Container {
  readonly csvFileRepository = new PrismaCsvFileRepository();
  readonly storage = new S3StorageAdapter();
  readonly messageQueue = new SqsMessageQueueAdapter();
  readonly csvParser = new CsvParserAdapter();

  readonly commandBus = new CommandBus();
  readonly queryBus = new QueryBus();

  constructor() {
    this.commandBus.register(
      "UploadCsvCommand",
      new UploadCsvHandler(this.csvFileRepository, this.storage, this.messageQueue)
    );
    this.commandBus.register(
      "ProcessCsvCommand",
      new ProcessCsvHandler(this.csvFileRepository, this.storage, this.csvParser)
    );

    this.queryBus.register(
      "GetCsvFileQuery",
      new GetCsvFileHandler(this.csvFileRepository)
    );
    this.queryBus.register(
      "ListCsvFilesQuery",
      new ListCsvFilesHandler(this.csvFileRepository)
    );
  }

  async bootstrapInfra(): Promise<void> {
    await this.storage.ensureBucketExists();
    await this.messageQueue.ensureQueueExists("csv-processing-queue");
  }
}

export const container = new Container();
