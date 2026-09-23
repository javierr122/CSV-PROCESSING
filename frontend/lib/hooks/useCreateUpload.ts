"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadsApi } from "../api/uploadsApi";

export function useCreateUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadsApi.create(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
    },
  });
}
