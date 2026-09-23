import { IQueryHandler } from "../../../../shared/application/IQueryHandler";
import { Either, right } from "../../../../shared/domain/Either";
import { ListUploadsQuery } from "../objects/ListUploadsQuery";
import { IUploadRepository } from "../../../domain/repositories/IUploadRepository";
import { UploadDto } from "../../dtos/UploadDto";

export interface ListUploadsResult {
  data: UploadDto[];
  total: number;
  page: number;
  limit: number;
}

export class ListUploadsQueryHandler
  implements IQueryHandler<ListUploadsQuery, never, ListUploadsResult>
{
  constructor(private readonly uploadRepository: IUploadRepository) {}

  async execute(query: ListUploadsQuery): Promise<Either<never, ListUploadsResult>> {
    const { items, total } = await this.uploadRepository.findAll({
      page: query.page,
      limit: query.limit,
      userId: query.userId,
    });

    const data: UploadDto[] = items.map((upload) => {
      const p = upload.toPrimitives();
      return {
        id: p.id,
        fileName: p.fileName,
        status: p.status,
        totalRows: p.totalRows,
        processedRows: p.processedRows,
        failedRows: p.failedRows,
        errorMessage: p.errorMessage,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    return right({ data, total, page: query.page, limit: query.limit });
  }
}
