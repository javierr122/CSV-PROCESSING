import { randomUUID } from "crypto";
import { CommandHandler } from "../../cqrs/command";
import { UploadCsvCommand } from "./upload-csv.command";
import { CsvFile } from "../../../domain/csv-file/csv-file.entity";
import { CsvFileRepository } from "../../../domain/csv-file/csv-file.repository";
import { StoragePort } from "../../ports/storage.port";
import { MessageQueuePort } from "../../ports/message-queue.port";
import { CsvFileMapper } from "../../mappers/csv-file.mapper";
import { CsvFileDto } from "../../dtos/csv-file.dto";

export class UploadCsvHandler implements CommandHandler<UploadCsvCommand, CsvFileDto> {
  constructor(
    private readonly csvFileRepository: CsvFileRepository,
    private readonly storage: StoragePort,
    private readonly messageQueue: MessageQueuePort
  ) {}

  async execute(command: UploadCsvCommand): Promise<CsvFileDto> {
    const key = `csv-files/${randomUUID()}-${command.fileName}`;

    const { bucket } = await this.storage.upload({
      key,
      body: command.fileContent,
      contentType: "text/csv",
    });

    const csvFile = CsvFile.create({
      fileName: command.fileName,
      s3Key: key,
      s3Bucket: bucket,
      sizeInBytes: command.fileContent.byteLength,
      uploadedBy: command.uploadedBy,
    });

    await this.csvFileRepository.save(csvFile);

    await this.messageQueue.publish({ csvFileId: csvFile.id });

    return CsvFileMapper.toDto(csvFile);
  }
}
