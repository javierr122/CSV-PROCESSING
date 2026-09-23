export interface CsvFileDto {
  id: string;
  fileName: string;
  status: string;
  sizeInBytes: number;
  rowCount: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
}
