import { CsvFile } from "../../domain/csv-file/csv-file.entity";
import { CsvFileDto } from "../dtos/csv-file.dto";

export class CsvFileMapper {
  static toDto(csvFile: CsvFile): CsvFileDto {
    const p = csvFile.toPrimitives();
    return {
      id: p.id,
      fileName: p.fileName,
      status: p.status,
      sizeInBytes: p.sizeInBytes,
      rowCount: p.rowCount,
      errorMessage: p.errorMessage,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      processedAt: p.processedAt ? p.processedAt.toISOString() : null,
    };
  }
}
