"use client";

import Link from "next/link";
import { useUpload } from "../lib/hooks/useUploads";
import { UploadStatusBadge } from "./UploadStatusBadge";
import { StatusTimeline } from "./StatusTimeline";
import { ProcessingStatus } from "./ProcessingStatus";
import { ResultsTable } from "./ResultsTable";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { IconChevronLeft, IconFileText, IconXCircle } from "./icons";

export function UploadDetail({ id }: { id: string }) {
  const { data, isLoading, isError } = useUpload(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-24" />
        <Card className="p-6">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="mt-4 h-16 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <p className="text-sm text-danger-600">No se pudo cargar el upload.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/uploads"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <IconChevronLeft className="h-4 w-4" />
        Volver a la lista
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <IconFileText className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{data.fileName}</h1>
              <p className="text-sm text-gray-500">
                Subido el {new Date(data.createdAt).toLocaleString("es-CO")}
              </p>
            </div>
          </div>
          <UploadStatusBadge status={data.status} />
        </div>

        <div className="mt-6">
          <StatusTimeline status={data.status} />
        </div>

        {(data.status === "PENDING" || data.status === "PROCESSING") && (
          <div className="mt-6">
            <ProcessingStatus upload={data} />
          </div>
        )}

        {data.totalRows !== null && (
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{data.totalRows}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Procesadas</p>
              <p className="mt-1 text-xl font-semibold text-success-600">{data.processedRows}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Fallidas</p>
              <p className="mt-1 text-xl font-semibold text-danger-600">{data.failedRows}</p>
            </div>
          </div>
        )}

        {data.status === "FAILED" && data.errorMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-danger-100 bg-danger-50 p-4">
            <IconXCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger-600" />
            <div>
              <p className="text-sm font-medium text-danger-700">El procesamiento falló</p>
              <p className="mt-0.5 text-sm text-danger-600">{data.errorMessage}</p>
            </div>
          </div>
        )}
      </Card>

      {data.status === "COMPLETED" && <ResultsTable uploadId={data.id} />}
    </div>
  );
}
