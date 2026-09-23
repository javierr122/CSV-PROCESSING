"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadCsv } from "../lib/hooks/use-upload-csv";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function CsvUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadCsv = useUploadCsv();
  const router = useRouter();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  async function handleSubmit() {
    if (!selectedFile) return;
    await uploadCsv.mutateAsync(selectedFile);
    setSelectedFile(null);
    router.push("/");
  }

  return (
    <Card className="p-6">
      <label className="block text-sm font-medium text-gray-700">
        Archivo CSV
      </label>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mt-2 block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
      />

      {uploadCsv.isError && (
        <p className="mt-3 text-sm text-red-600">
          Ocurrió un error al subir el archivo. Intenta de nuevo.
        </p>
      )}

      <div className="mt-4">
        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || uploadCsv.isPending}
        >
          {uploadCsv.isPending ? "Subiendo..." : "Subir archivo"}
        </Button>
      </div>
    </Card>
  );
}
