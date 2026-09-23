import { apiClient } from "./api-client";
import { ListUploadsResponse, UploadDto, UploadResultsResponse } from "../types/upload.types";

export interface ListUploadsParams {
  page?: number;
  limit?: number;
}

export const uploadsApi = {
  create: async (file: File): Promise<UploadDto> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<UploadDto>("/api/v1/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getById: async (id: string): Promise<UploadDto> => {
    const { data } = await apiClient.get<UploadDto>(`/api/v1/uploads/${id}`);
    return data;
  },

  list: async (params: ListUploadsParams = {}): Promise<ListUploadsResponse> => {
    const { data } = await apiClient.get<ListUploadsResponse>("/api/v1/uploads", { params });
    return data;
  },

  getResults: async (id: string): Promise<UploadResultsResponse> => {
    const { data } = await apiClient.get<UploadResultsResponse>(`/api/v1/uploads/${id}/results`);
    return data;
  },
};
