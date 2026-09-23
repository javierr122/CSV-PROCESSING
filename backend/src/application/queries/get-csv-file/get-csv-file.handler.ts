import { QueryHandler } from "../../cqrs/query";
import { GetCsvFileQuery } from "./get-csv-file.query";
import { CsvFileRepository } from "../../../domain/csv-file/csv-file.repository";
import { NotFoundError } from "../../../domain/shared/errors/domain-error";
import { CsvFileMapper } from "../../mappers/csv-file.mapper";
import { CsvFileDto } from "../../dtos/csv-file.dto";

export class GetCsvFileHandler implements QueryHandler<GetCsvFileQuery, CsvFileDto> {
  constructor(private readonly csvFileRepository: CsvFileRepository) {}

  async execute(query: GetCsvFileQuery): Promise<CsvFileDto> {
    const csvFile = await this.csvFileRepository.findById(query.id);
    if (!csvFile) {
      throw new NotFoundError("CsvFile", query.id);
    }
    return CsvFileMapper.toDto(csvFile);
  }
}
