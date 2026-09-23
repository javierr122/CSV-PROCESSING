import { Upload } from "../entities/Upload";

export interface ListUploadsFilters {
  userId?: string;
  page: number;
  limit: number;
}

export interface IUploadRepository {
  save(upload: Upload): Promise<void>;
  findById(id: string): Promise<Upload | null>;
  findAll(filters: ListUploadsFilters): Promise<{ items: Upload[]; total: number }>;
  countByStatus(userId?: string): Promise<Record<string, number>>;
}
