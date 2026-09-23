export interface UploadDto {
  id: string;
  fileName: string;
  status: string;
  totalRows: number | null;
  processedRows: number | null;
  failedRows: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityDataDto {
  category: string;
  amount: number;
  unit: string;
  date: string;
}
