import { CsvFile } from "./csv-file.entity";

export interface CsvFileFilters {
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * Puerto de salida del dominio: la infraestructura (Prisma) provee la implementación.
 */
export interface CsvFileRepository {
  save(csvFile: CsvFile): Promise<void>;
  findById(id: string): Promise<CsvFile | null>;
  findAll(filters?: CsvFileFilters): Promise<CsvFile[]>;
  count(filters?: CsvFileFilters): Promise<number>;
}

export const CSV_FILE_REPOSITORY = Symbol("CsvFileRepository");
