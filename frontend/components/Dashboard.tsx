"use client";

import Link from "next/link";
import { useUploads } from "../lib/hooks/useUploads";
import { StatTile } from "./ui/stat-tile";
import { MonthlyActivityChart } from "./MonthlyActivityChart";
import { Skeleton } from "./ui/skeleton";
import { Card, CardHeader, CardTitle, CardBody } from "./ui/card";
import { EmptyState } from "./ui/empty-state";
import { UploadStatusBadge } from "./UploadStatusBadge";
import { Button } from "./ui/button";
import {
  IconInbox,
  IconCheckCircle,
  IconClock,
  IconXCircle,
  IconUploadCloud,
  IconChevronRight,
} from "./icons";

export function Dashboard() {
  const { data, isLoading } = useUploads({ page: 1, limit: 100 });

  const total = data?.total ?? 0;
  const completed = data?.data.filter((u) => u.status === "COMPLETED").length ?? 0;
  const processing =
    data?.data.filter((u) => u.status === "PROCESSING" || u.status === "PENDING").length ?? 0;
  const failed = data?.data.filter((u) => u.status === "FAILED").length ?? 0;
  const recent = data?.data.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-brand-700 via-brand-600 to-blue-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Resultados
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Estado general del procesamiento de archivos CSV.
          </p>
        </div>
        <Link href="/uploads/new">
          <Button>
            <IconUploadCloud className="h-4 w-4" />
            Subir archivo
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Total uploads" value={total} tone="neutral" icon={<IconInbox className="h-4 w-4" />} />
          <StatTile
            label="Completados"
            value={completed}
            tone="success"
            icon={<IconCheckCircle className="h-4 w-4" />}
          />
          <StatTile label="En proceso" value={processing} tone="brand" icon={<IconClock className="h-4 w-4" />} />
          <StatTile label="Fallidos" value={failed} tone="danger" icon={<IconXCircle className="h-4 w-4" />} />
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <MonthlyActivityChart uploads={data?.data ?? []} />
      )}

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Uploads recientes</CardTitle>
          <Link
            href="/uploads"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Ver todos
            <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>

        {isLoading ? (
          <CardBody className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardBody>
        ) : recent.length === 0 ? (
          <CardBody>
            <EmptyState
              icon={<IconInbox className="h-6 w-6" />}
              title="Todavía no subiste ningún archivo"
              description="Sube tu primer CSV para empezar a ver el procesamiento en tiempo real."
              action={
                <Link href="/uploads/new">
                  <Button size="sm">Subir archivo</Button>
                </Link>
              }
            />
          </CardBody>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((upload) => (
              <li key={upload.id}>
                <Link
                  href={`/uploads/${upload.id}`}
                  className="group flex items-center justify-between border-l-2 border-transparent px-5 py-3.5 transition-all hover:border-brand-500 hover:bg-brand-50/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 group-hover:text-brand-700">
                      {upload.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(upload.createdAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <UploadStatusBadge status={upload.status} />
                    <IconChevronRight className="h-3.5 w-3.5 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
