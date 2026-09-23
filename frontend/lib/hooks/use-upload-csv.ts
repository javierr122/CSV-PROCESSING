"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { csvFilesApi } from "../api/csv-files.api";

export function useUploadCsv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => csvFilesApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["csv-files"] });
    },
  });
}
