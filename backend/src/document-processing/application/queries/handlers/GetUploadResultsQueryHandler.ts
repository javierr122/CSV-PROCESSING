import { IQueryHandler } from "../../../../shared/application/IQueryHandler";
import { Either, left, right } from "../../../../shared/domain/Either";
import { GetUploadResultsQuery } from "../objects/GetUploadResultsQuery";
import { IUploadRepository } from "../../../domain/repositories/IUploadRepository";
import { IActivityDataRepository } from "../../../domain/repositories/IActivityDataRepository";
import { UploadNotFoundError } from "../../commands/handlers/ProcessFileCommandHandler";
import { ActivityDataDto } from "../../dtos/UploadDto";

export class GetUploadResultsQueryHandler
  implements IQueryHandler<GetUploadResultsQuery, UploadNotFoundError, { data: ActivityDataDto[] }>
{
  constructor(
    private readonly uploadRepository: IUploadRepository,
    private readonly activityDataRepository: IActivityDataRepository
  ) {}

  async execute(
    query: GetUploadResultsQuery
  ): Promise<Either<UploadNotFoundError, { data: ActivityDataDto[] }>> {
    const upload = await this.uploadRepository.findById(query.uploadId);
    if (!upload) {
      return left(new UploadNotFoundError(query.uploadId));
    }

    const rows = await this.activityDataRepository.findByUploadId(query.uploadId);

    const data: ActivityDataDto[] = rows.map((row) => {
      const p = row.toPrimitives();
      return {
        category: p.category,
        amount: p.amount,
        unit: p.unit,
        date: p.date.toISOString().slice(0, 10),
      };
    });

    return right({ data });
  }
}
