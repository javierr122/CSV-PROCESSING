"use client";

import { useUploadResults } from "../lib/hooks/useUploads";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { EmptyState } from "./ui/empty-state";
import { IconInbox } from "./icons";

export function ResultsTable({ uploadId }: { uploadId: string }) {
  const { data, isLoading, isError } = useUploadResults(uploadId, true);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Datos procesados</CardTitle>
        </CardHeader>
        <div className="space-y-2 p-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<IconInbox className="h-6 w-6" />}
        title="No se pudieron cargar los resultados"
      />
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState icon={<IconInbox className="h-6 w-6" />} title="No hay datos procesados para este archivo" />
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Datos procesados</CardTitle>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {data.data.length} filas
        </span>
      </CardHeader>
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-b border-gray-100 bg-gray-50/95 text-xs uppercase tracking-wide text-gray-500 backdrop-blur">
            <tr>
              <th className="px-5 py-2.5 font-medium">Categoría</th>
              <th className="px-5 py-2.5 font-medium">Cantidad</th>
              <th className="px-5 py-2.5 font-medium">Unidad</th>
              <th className="px-5 py-2.5 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.data.map((row, index) => (
              <tr key={`${row.category}-${row.date}-${index}`} className="odd:bg-white even:bg-gray-50/40">
                <td className="px-5 py-2.5 font-medium text-gray-900">{row.category}</td>
                <td className="px-5 py-2.5 text-gray-600">{row.amount}</td>
                <td className="px-5 py-2.5 text-gray-600">{row.unit}</td>
                <td className="px-5 py-2.5 text-gray-600">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
