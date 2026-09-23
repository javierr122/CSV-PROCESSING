import { IQueryHandler } from "../../../../shared/application/IQueryHandler";
import { Either, left, right } from "../../../../shared/domain/Either";
import { GetUploadByIdQuery } from "../objects/GetUploadByIdQuery";
import { IUploadRepository } from "../../../domain/repositories/IUploadRepository";
import { UploadNotFoundError } from "../../commands/handlers/ProcessFileCommandHandler";
import { UploadDto } from "../../dtos/UploadDto";

export class GetUploadByIdQueryHandler
  implements IQueryHandler<GetUploadByIdQuery, UploadNotFoundError, UploadDto>
{
  constructor(private readonly uploadRepository: IUploadRepository) {}

  async execute(query: GetUploadByIdQuery): Promise<Either<UploadNotFoundError, UploadDto>> {
    const upload = await this.uploadRepository.findById(query.id);
    if (!upload) {
      return left(new UploadNotFoundError(query.id));
    }

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
