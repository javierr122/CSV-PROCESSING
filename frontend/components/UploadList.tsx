"use client";

import { useState } from "react";
import Link from "next/link";
import { useUploads } from "../lib/hooks/useUploads";
import { UploadStatusBadge } from "./UploadStatusBadge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { EmptyState } from "./ui/empty-state";
import { IconChevronLeft, IconChevronRight, IconFileText, IconInbox, IconUploadCloud } from "./icons";

const PAGE_SIZE = 10;

export function UploadList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useUploads({ page, limit: PAGE_SIZE });

  if (isLoading) {
    return (
      <Card className="divide-y divide-gray-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </Card>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<IconInbox className="h-6 w-6" />}
        title="No se pudieron cargar los uploads"
        description="Verifica que el backend esté corriendo e intenta de nuevo."
      />
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        icon={<IconInbox className="h-6 w-6" />}
        title="Todavía no subiste ningún archivo CSV"
        description="Sube un archivo para comenzar a procesarlo de forma asíncrona."
        action={
          <Link href="/uploads/new">
            <Button size="sm">
              <IconUploadCloud className="h-4 w-4" />
              Subir archivo
            </Button>
          </Link>
        }
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div>
      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Archivo</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Fecha de subida</th>
              <th className="px-5 py-3 font-medium">Filas</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.data.map((upload) => (
              <tr
                key={upload.id}
                className="group border-l-2 border-transparent transition-all hover:border-brand-500 hover:bg-brand-50/50"
              >
                <td className="px-5 py-3.5">
                  <Link href={`/uploads/${upload.id}`} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
                      <IconFileText className="h-4 w-4" />
                    </span>
                    <span className="truncate font-medium text-gray-900 group-hover:text-brand-700">
                      {upload.fileName}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <UploadStatusBadge status={upload.status} />
                </td>
                <td className="px-5 py-3.5 text-gray-500">
                  {new Date(upload.createdAt).toLocaleString("es-CO")}
                </td>
                <td className="px-5 py-3.5 text-gray-500">
                  {upload.processedRows ?? "—"}
                  {upload.totalRows ? ` / ${upload.totalRows}` : ""}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/uploads/${upload.id}`}
                    className="text-sm font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-brand-700"
                  >
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Página <span className="font-medium text-gray-900">{data.page}</span> de{" "}
          <span className="font-medium text-gray-900">{totalPages}</span> · {data.total} uploads
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <IconChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
