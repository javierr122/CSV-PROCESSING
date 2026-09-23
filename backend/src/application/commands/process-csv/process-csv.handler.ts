import { CommandHandler } from "../../cqrs/command";
import { ProcessCsvCommand } from "./process-csv.command";
import { CsvFileRepository } from "../../../domain/csv-file/csv-file.repository";
import { NotFoundError } from "../../../domain/shared/errors/domain-error";
import { StoragePort } from "../../ports/storage.port";
import { CsvParserPort } from "../../ports/csv-parser.port";

/**
 * Handler consumido por el worker de SQS: descarga el CSV de S3, lo parsea
 * y actualiza el estado del agregado (PROCESSING -> COMPLETED | FAILED).
 */
export class ProcessCsvHandler implements CommandHandler<ProcessCsvCommand, void> {
  constructor(
    private readonly csvFileRepository: CsvFileRepository,
    private readonly storage: StoragePort,
    private readonly csvParser: CsvParserPort
  ) {}

  async execute(command: ProcessCsvCommand): Promise<void> {
    const csvFile = await this.csvFileRepository.findById(command.csvFileId);
    if (!csvFile) {
      throw new NotFoundError("CsvFile", command.csvFileId);
    }

    csvFile.markAsProcessing();
    await this.csvFileRepository.save(csvFile);

    try {
      const { s3Key } = csvFile.toPrimitives();
      const fileContent = await this.storage.download(s3Key);
      const rowCount = await this.csvParser.countRows(fileContent);

      csvFile.markAsCompleted(rowCount);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      csvFile.markAsFailed(message);
    }

    await this.csvFileRepository.save(csvFile);
  }
}
