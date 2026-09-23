export type UploadStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface UploadDto {
  id: string;
  fileName: string;
  status: UploadStatus;
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

export interface ListUploadsResponse {
  data: UploadDto[];
  total: number;
  page: number;
  limit: number;
}

export interface UploadResultsResponse {
  data: ActivityDataDto[];
}
