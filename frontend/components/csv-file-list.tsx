"use client";

import Link from "next/link";
import { useCsvFiles } from "../lib/hooks/use-csv-files";
import { CsvFileStatusBadge } from "./csv-file-status-badge";
import { Card } from "./ui/card";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CsvFileList() {
  const { data, isLoading, isError } = useCsvFiles();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Cargando archivos...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-600">No se pudieron cargar los archivos.</p>;
  }

  if (!data || data.items.length === 0) {
    return <p className="text-sm text-gray-500">Todavía no subiste ningún archivo CSV.</p>;
  }

  return (
    <Card className="divide-y divide-gray-100">
      {data.items.map((file) => (
        <Link
          key={file.id}
          href={`/files/${file.id}`}
          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
            <p className="text-xs text-gray-500">
              {formatBytes(file.sizeInBytes)}
              {file.rowCount !== null ? ` · ${file.rowCount} filas` : ""}
            </p>
          </div>
          <CsvFileStatusBadge status={file.status} />
        </Link>
      ))}
    </Card>
  );
}
