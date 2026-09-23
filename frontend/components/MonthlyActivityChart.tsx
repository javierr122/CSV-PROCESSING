"use client";

import { useMemo } from "react";
import { UploadDto } from "../lib/types/upload.types";
import { Card, CardHeader, CardTitle, CardBody } from "./ui/card";
import { EmptyState } from "./ui/empty-state";
import { IconTrendUp } from "./icons";

interface MonthlyActivityChartProps {
  uploads: UploadDto[];
}

interface MonthBucket {
  key: string;
  label: string;
  count: number;
}

const MONTH_LABEL = new Intl.DateTimeFormat("es-CO", { month: "short", year: "2-digit" });

/**
 * Agrupa los uploads por mes de creación (solo meses en los que
 * efectivamente se subió al menos un archivo) y arma los buckets
 * ordenados cronológicamente para el gráfico de barras.
 */
function buildMonthlyBuckets(uploads: UploadDto[]): MonthBucket[] {
  const counts = new Map<string, number>();

  for (const upload of uploads) {
    const date = new Date(upload.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, count]) => {
      const [year, month] = key.split("-").map(Number);
      const label = MONTH_LABEL.format(new Date(year, month - 1, 1));
      return { key, label, count };
    });
}

export function MonthlyActivityChart({ uploads }: MonthlyActivityChartProps) {
  const buckets = useMemo(() => buildMonthlyBuckets(uploads), [uploads]);
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Actividad mensual</CardTitle>
        <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
          <IconTrendUp className="h-3.5 w-3.5 text-brand-500" />
          Archivos subidos por mes
        </span>
      </CardHeader>

      <CardBody>
        {buckets.length === 0 ? (
          <EmptyState
            icon={<IconTrendUp className="h-6 w-6" />}
            title="Todavía no hay actividad para graficar"
            description="En cuanto subas archivos vas a ver aquí la cantidad por mes."
          />
        ) : (
          <div className="flex h-48 items-end justify-between gap-2 sm:gap-4">
            {buckets.map((bucket) => {
              const heightPct = Math.max(6, Math.round((bucket.count / maxCount) * 100));
              return (
                <div key={bucket.key} className="flex h-full flex-1 flex-col items-center justify-end">
                  <span className="mb-1 text-xs font-semibold text-gray-700">{bucket.count}</span>
                  <div
                    className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-brand-700 via-brand-500 to-blue-400 shadow-sm shadow-brand-500/30 transition-all duration-300 hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                    title={`${bucket.label}: ${bucket.count} archivo(s)`}
                  />
                  <span className="mt-2 text-[11px] font-medium capitalize text-gray-500">
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
