import { UploadDto } from "../lib/types/upload.types";

/**
 * Barra de progreso indeterminada/determinada, visible solo mientras el
 * upload está PENDING o PROCESSING.
 */
export function ProcessingStatus({ upload }: { upload: UploadDto }) {
  if (upload.status !== "PENDING" && upload.status !== "PROCESSING") return null;

  const hasProgress = upload.totalRows && upload.totalRows > 0;
  const percent = hasProgress
    ? Math.min(100, Math.round(((upload.processedRows ?? 0) / upload.totalRows!) * 100))
    : null;

  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: percent !== null ? `${percent}%` : "35%" }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {upload.status === "PENDING"
          ? "En cola, esperando ser procesado..."
          : `Procesando archivo${percent !== null ? ` (${percent}%)` : ""}... se actualiza automáticamente`}
      </p>
    </div>
  );
}
