"use client";

import { DragEvent, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateUpload } from "../lib/hooks/useCreateUpload";
import { useToast } from "./Toast";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { IconFileText, IconSpinner, IconUploadCloud, IconX } from "./icons";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Formulario de subida con drag & drop, preview del archivo seleccionado
 * (nombre + tamaño, con opción de quitarlo) y feedback vía toast.
 */
export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const createUpload = useCreateUpload();
  const toast = useToast();
  const router = useRouter();

  const validateAndSetFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setValidationError("Solo se permiten archivos .csv");
      setSelectedFile(null);
      return;
    }
    setValidationError(null);
    setSelectedFile(file);
  }, []);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    validateAndSetFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit() {
    if (!selectedFile) return;
    try {
      const upload = await createUpload.mutateAsync(selectedFile);
      toast.show({
        variant: "success",
        title: "Archivo subido correctamente",
        description: "Lo estamos procesando en segundo plano.",
      });
      router.push(`/uploads/${upload.id}`);
    } catch {
      toast.show({
        variant: "error",
        title: "No se pudo subir el archivo",
        description: "Verifica tu conexión con el backend e intenta de nuevo.",
      });
    }
  }

  return (
    <Card className="p-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          isDragging ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-gray-50/50"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <IconUploadCloud className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-900">
          Arrastra tu archivo CSV aquí
        </p>
        <p className="mt-1 text-sm text-gray-500">o haz click para buscarlo en tu equipo</p>

        <label className="mt-4 cursor-pointer">
          <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            Seleccionar archivo
          </span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => validateAndSetFile(e.target.files?.[0])}
          />
        </label>
      </div>

      {selectedFile && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <IconFileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</p>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Quitar archivo"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      )}

      {validationError && (
        <p className="mt-3 text-sm font-medium text-danger-600">{validationError}</p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={!selectedFile || createUpload.isPending}>
          {createUpload.isPending ? (
            <>
              <IconSpinner className="h-4 w-4" />
              Subiendo...
            </>
          ) : (
            <>
              <IconUploadCloud className="h-4 w-4" />
              Subir archivo
            </>
          )}
        </Button>
        <p className="text-xs text-gray-400">Formato requerido: category, amount, unit, date</p>
      </div>
    </Card>
  );
}
