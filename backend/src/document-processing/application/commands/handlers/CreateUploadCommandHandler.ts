import { ICommandHandler } from "../../../../shared/application/ICommandHandler";
import { Either, left, right } from "../../../../shared/domain/Either";
import { CreateUploadCommand } from "../objects/CreateUploadCommand";
import { Upload } from "../../../domain/entities/Upload";
import { IUploadRepository } from "../../../domain/repositories/IUploadRepository";
import { FileName, InvalidFileNameError } from "../../../domain/value-objects/FileName";
import { IFileStorage } from "../../../infrastructure/storage/IFileStorage";
import { IMessagePublisher } from "../../../../shared/infrastructure/messaging/IMessagePublisher";
import { UploadDto } from "../../dtos/UploadDto";

export type CreateUploadError = InvalidFileNameError;

/**
 * Command Handler: valida el nombre de archivo (Either), lo sube al storage,
 * crea el Upload en estado PENDING y publica el mensaje de procesamiento
 * asíncrono. No usa try/catch para el control de flujo esperado: los errores
 * de negocio viajan como Either.left.
 */
export class CreateUploadCommandHandler
  implements ICommandHandler<CreateUploadCommand, CreateUploadError, UploadDto>
{
  constructor(
    private readonly uploadRepository: IUploadRepository,
    private readonly fileStorage: IFileStorage,
    private readonly messagePublisher: IMessagePublisher
  ) {}

  async execute(command: CreateUploadCommand): Promise<Either<CreateUploadError, UploadDto>> {
    console.log(
      `[CreateUpload] ⬆ archivo recibido -> "${command.fileName}" (${command.fileContent.byteLength} bytes, userId=${command.userId})`
    );

    const fileNameOrError = FileName.create(command.fileName);
    if (fileNameOrError.isLeft()) {
      console.warn(`[CreateUpload] ✗ nombre de archivo inválido: ${fileNameOrError.value.message}`);
      return left(fileNameOrError.value);
    }

    const fileUrl = await this.fileStorage.upload({
      key: `uploads/${Date.now()}-${command.fileName}`,
      body: command.fileContent,
      contentType: "text/csv",
    });
    console.log(`[CreateUpload] archivo guardado en storage -> ${fileUrl}`);

    const upload = Upload.create({
      fileName: fileNameOrError.value.value,
      fileUrl,
      userId: command.userId,
    });

    await this.uploadRepository.save(upload);
    console.log(`[CreateUpload] Upload creado en estado PENDING -> id=${upload.id}`);

    await this.messagePublisher.publish({ uploadId: upload.id });
    console.log(`[CreateUpload] mensaje de procesamiento encolado -> id=${upload.id} (el worker lo tomará async)`);

    const p = upload.toPrimitives();
    return right({
      id: p.id,
      fileName: p.fileName,
      status: p.status,
      totalRows: p.totalRows,
      processedRows: p.processedRows,
      failedRows: p.failedRows,
      errorMessage: p.errorMessage,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    });
  }
}
