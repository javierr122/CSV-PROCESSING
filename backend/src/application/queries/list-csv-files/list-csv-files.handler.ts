import { QueryHandler } from "../../cqrs/query";
import { ListCsvFilesQuery } from "./list-csv-files.query";
import { CsvFileRepository } from "../../../domain/csv-file/csv-file.repository";
import { CsvFileMapper } from "../../mappers/csv-file.mapper";
import { CsvFileDto } from "../../dtos/csv-file.dto";

export interface ListCsvFilesResult {
  items: CsvFileDto[];
  total: number;
  limit: number;
  offset: number;
}

export class ListCsvFilesHandler
  implements QueryHandler<ListCsvFilesQuery, ListCsvFilesResult>
{
  constructor(private readonly csvFileRepository: CsvFileRepository) {}

  async execute(query: ListCsvFilesQuery): Promise<ListCsvFilesResult> {
    const filters = {
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    };

    const [items, total] = await Promise.all([
      this.csvFileRepository.findAll(filters),
      this.csvFileRepository.count(filters),
    ]);

    return {
      items: items.map(CsvFileMapper.toDto),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }
}
