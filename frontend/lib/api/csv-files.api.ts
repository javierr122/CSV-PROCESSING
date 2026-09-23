import { apiClient } from "./client";
import { CsvFileDto, ListCsvFilesResult } from "../types/csv-file";

export interface ListCsvFilesParams {
  status?: string;
  limit?: number;
  offset?: number;
}

export const csvFilesApi = {
  list: async (params: ListCsvFilesParams = {}): Promise<ListCsvFilesResult> => {
    const { data } = await apiClient.get<ListCsvFilesResult>("/csv-files", { params });
    return data;
  },

  getById: async (id: string): Promise<CsvFileDto> => {
    const { data } = await apiClient.get<CsvFileDto>(`/csv-files/${id}`);
    return data;
  },

  upload: async (file: File): Promise<CsvFileDto> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<CsvFileDto>("/csv-files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
