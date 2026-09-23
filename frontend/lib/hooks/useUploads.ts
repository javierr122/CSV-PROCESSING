"use client";

import { useQuery } from "@tanstack/react-query";
import { uploadsApi, ListUploadsParams } from "../api/uploadsApi";

export function useUploads(params: ListUploadsParams = {}) {
  return useQuery({
    queryKey: ["uploads", params],
    queryFn: () => uploadsApi.list(params),
  });
}

/**
 * Polling automático cada 3 segundos mientras el upload esté
 * PENDING o PROCESSING; se detiene solo al llegar a un estado terminal.
 */
export function useUpload(id: string) {
  return useQuery({
    queryKey: ["uploads", id],
    queryFn: () => uploadsApi.getById(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 3000 : false;
    },
  });
}

export function useUploadResults(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["uploads", id, "results"],
    queryFn: () => uploadsApi.getResults(id),
    enabled: Boolean(id) && enabled,
  });
}
