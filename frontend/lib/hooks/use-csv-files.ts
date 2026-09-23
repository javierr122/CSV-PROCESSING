"use client";

import { useQuery } from "@tanstack/react-query";
import { csvFilesApi, ListCsvFilesParams } from "../api/csv-files.api";

export function useCsvFiles(params: ListCsvFilesParams = {}) {
  return useQuery({
    queryKey: ["csv-files", params],
    queryFn: () => csvFilesApi.list(params),
    refetchInterval: 5000,
  });
}

export function useCsvFile(id: string) {
  return useQuery({
    queryKey: ["csv-files", id],
    queryFn: () => csvFilesApi.getById(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 3000 : false;
    },
  });
}
