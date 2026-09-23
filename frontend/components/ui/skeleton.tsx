import clsx from "clsx";

/**
 * Placeholder de carga con efecto "shimmer", para reemplazar los estados
 * de "Cargando..." en texto plano.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-shimmer rounded-md bg-gray-100 bg-[length:400px_100%]",
        "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100",
        className
      )}
    />
  );
}
