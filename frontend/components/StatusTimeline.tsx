import clsx from "clsx";
import { UploadStatus } from "../lib/types/upload.types";
import { IconCheckCircle, IconSpinner, IconXCircle } from "./icons";

const STEPS: { key: UploadStatus; label: string }[] = [
  { key: "PENDING", label: "Subido" },
  { key: "PROCESSING", label: "Procesando" },
  { key: "COMPLETED", label: "Completado" },
];

/**
 * Línea de tiempo horizontal del ciclo de vida de un Upload.
 * Si el estado es FAILED, el último paso se muestra en rojo con una X
 * en vez del check verde de "Completado".
 */
export function StatusTimeline({ status }: { status: UploadStatus }) {
  const isFailed = status === "FAILED";
  const currentIndex = isFailed ? 2 : STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex || (index === currentIndex && status === "COMPLETED");
        const isCurrent = index === currentIndex && status !== "COMPLETED" && !isFailed;
        const isLastAndFailed = isFailed && index === STEPS.length - 1;

        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  isLastAndFailed && "border-danger-500 bg-danger-50 text-danger-600",
                  !isLastAndFailed && isDone && "border-success-500 bg-success-50 text-success-600",
                  !isLastAndFailed && isCurrent && "border-brand-500 bg-brand-50 text-brand-600",
                  !isLastAndFailed && !isDone && !isCurrent && "border-gray-200 bg-gray-50 text-gray-400"
                )}
              >
                {isLastAndFailed ? (
                  <IconXCircle className="h-4 w-4" />
                ) : isDone ? (
                  <IconCheckCircle className="h-4 w-4" />
                ) : isCurrent ? (
                  <IconSpinner className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={clsx(
                  "text-xs font-medium",
                  isLastAndFailed ? "text-danger-600" : isDone || isCurrent ? "text-gray-900" : "text-gray-400"
                )}
              >
                {isLastAndFailed ? "Fallido" : step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={clsx(
                  "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                  index < currentIndex ? "bg-success-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
