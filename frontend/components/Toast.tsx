"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { IconCheckCircle, IconXCircle, IconX } from "./icons";

type ToastVariant = "success" | "error";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextValue {
  show: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

/**
 * Sistema de notificaciones toast minimalista (sin dependencia externa).
 * Se usa, por ejemplo, para confirmar que un archivo se subió correctamente
 * o para avisar de un error de red.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm animate-fade-in items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-popover"
          >
            <div
              className={
                toast.variant === "success"
                  ? "mt-0.5 shrink-0 text-success-600"
                  : "mt-0.5 shrink-0 text-danger-600"
              }
            >
              {toast.variant === "success" ? (
                <IconCheckCircle className="h-5 w-5" />
              ) : (
                <IconXCircle className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-sm text-gray-500">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar notificación"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
