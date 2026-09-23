export type CsvFileStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface CsvFileDto {
  id: string;
  fileName: string;
  status: CsvFileStatus;
  sizeInBytes: number;
  rowCount: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
}

export interface ListCsvFilesResult {
  items: CsvFileDto[];
  total: number;
  limit: number;
  offset: number;
}
