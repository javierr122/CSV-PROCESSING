import clsx from "clsx";
import { UploadStatus } from "../lib/types/upload.types";
import { IconCheckCircle, IconClock, IconSpinner, IconXCircle } from "./icons";

const STATUS_CONFIG: Record<
  UploadStatus,
  { label: string; className: string; icon: (props: { className?: string }) => JSX.Element }
> = {
  PENDING: {
    label: "Pendiente",
    className: "bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-100",
    icon: (p) => <IconClock {...p} />,
  },
  PROCESSING: {
    label: "Procesando",
    className: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100",
    icon: (p) => <IconSpinner {...p} />,
  },
  COMPLETED: {
    label: "Completado",
    className: "bg-success-50 text-success-700 ring-1 ring-inset ring-success-100",
    icon: (p) => <IconCheckCircle {...p} />,
  },
  FAILED: {
    label: "Fallido",
    className: "bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-100",
    icon: (p) => <IconXCircle {...p} />,
  },
};

export function UploadStatusBadge({ status }: { status: UploadStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
