import { ICommandHandler } from "../../../../shared/application/ICommandHandler";
import { Either, left, right } from "../../../../shared/domain/Either";
import { ProcessFileCommand } from "../objects/ProcessFileCommand";
import { IUploadRepository } from "../../../domain/repositories/IUploadRepository";
import { IActivityDataRepository } from "../../../domain/repositories/IActivityDataRepository";
import { ActivityData } from "../../../domain/entities/ActivityData";
import { IFileStorage } from "../../../infrastructure/storage/IFileStorage";
import { CsvParserService } from "../../services/CsvParserService";

export class UploadNotFoundError extends Error {
  constructor(id: string) {
    super(`Upload con id "${id}" no fue encontrado`);
    this.name = "UploadNotFoundError";
  }
}

export type ProcessFileError = UploadNotFoundError;

/**
 * Command Handler ejecutado por el Worker: descarga el CSV, lo parsea y
 * valida fila por fila, guarda los datos válidos y marca el Upload como
 * COMPLETED (aunque haya filas inválidas) o FAILED si el archivo entero
 * no se pudo procesar.
 */
export class ProcessFileCommandHandler
  implements ICommandHandler<ProcessFileCommand, ProcessFileError, void>
{
  constructor(
    private readonly uploadRepository: IUploadRepository,
    private readonly activityDataRepository: IActivityDataRepository,
    private readonly fileStorage: IFileStorage,
    private readonly csvParser: CsvParserService
  ) {}

  async execute(command: ProcessFileCommand): Promise<Either<ProcessFileError, void>> {
    const tx = `tx-${command.uploadId.slice(0, 8)}`;
    const startedAt = Date.now();
    console.log(`[ProcessFile:${tx}] ▶ inicio -> uploadId=${command.uploadId}`);

    const upload = await this.uploadRepository.findById(command.uploadId);
    if (!upload) {
      console.warn(`[ProcessFile:${tx}] ✗ upload no encontrado, se aborta la transacción`);
      return left(new UploadNotFoundError(command.uploadId));
    }

    console.log(`[ProcessFile:${tx}] 1/4 estado -> PENDING → PROCESSING (fileUrl=${upload.toPrimitives().fileUrl})`);
    upload.markAsProcessing();
    await this.uploadRepository.save(upload);

    try {
      console.log(`[ProcessFile:${tx}] 2/4 descargando archivo del storage...`);
      const fileContent = await this.fileStorage.download(upload.toPrimitives().fileUrl);
      console.log(`[ProcessFile:${tx}]    descarga OK (${fileContent.byteLength} bytes)`);

      console.log(`[ProcessFile:${tx}] 3/4 parseando y validando filas...`);
      const { validRows, invalidRows, totalRows } = await this.csvParser.parse(fileContent);
      console.log(
        `[ProcessFile:${tx}]    total=${totalRows} válidas=${validRows.length} inválidas=${invalidRows.length}`
      );

      const activityData = validRows.map((row) =>
        ActivityData.create({
          uploadId: upload.id,
          category: row.category,
          amount: row.amount,
          unit: row.unit,
          date: row.date,
        })
      );

      if (activityData.length > 0) {
        console.log(`[ProcessFile:${tx}] 4/4 guardando ${activityData.length} filas en la base de datos...`);
        await this.activityDataRepository.saveMany(activityData);
        console.log(`[ProcessFile:${tx}]    guardado OK`);
      } else {
        console.log(`[ProcessFile:${tx}] 4/4 sin filas válidas para guardar`);
      }

      upload.markAsCompleted({
        totalRows,
        processedRows: validRows.length,
        failedRows: invalidRows.length,
      });
      console.log(`[ProcessFile:${tx}] estado -> PROCESSING → COMPLETED`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido procesando el archivo";
      console.error(`[ProcessFile:${tx}] ✗ excepción durante el procesamiento: ${message}`);
      upload.markAsFailed(message);
      console.log(`[ProcessFile:${tx}] estado -> PROCESSING → FAILED`);
    }

    await this.uploadRepository.save(upload);
    const elapsedMs = Date.now() - startedAt;
    console.log(`[ProcessFile:${tx}] ⏹ fin -> estado final persistido en ${elapsedMs}ms`);
    return right(undefined);
  }
}
