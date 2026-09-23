import clsx from "clsx";
import { CsvFileStatus } from "../lib/types/csv-file";

const STATUS_STYLES: Record<CsvFileStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<CsvFileStatus, string> = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  COMPLETED: "Completado",
  FAILED: "Fallido",
};

export function CsvFileStatusBadge({ status }: { status: CsvFileStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
