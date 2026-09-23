"use client";

import { useParams } from "next/navigation";
import { useCsvFile } from "../../../lib/hooks/use-csv-files";
import { CsvFileStatusBadge } from "../../../components/csv-file-status-badge";
import { Card } from "../../../components/ui/card";

export default function CsvFileDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useCsvFile(params.id);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Cargando...</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">No se pudo cargar el archivo.</p>;
  }

  return (
    <main>
      <h2 className="mb-6 text-lg font-semibold text-gray-900">{data.fileName}</h2>
      <Card className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Estado</span>
          <CsvFileStatusBadge status={data.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Filas procesadas</span>
          <span className="text-sm font-medium">{data.rowCount ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Subido el</span>
          <span className="text-sm font-medium">
            {new Date(data.createdAt).toLocaleString("es-CO")}
          </span>
        </div>
        {data.errorMessage && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {data.errorMessage}
          </div>
        )}
      </Card>
    </main>
  );
}
