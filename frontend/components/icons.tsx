/**
 * Set mínimo de iconos SVG inline (sin dependencia externa), estilo
 * "outline" consistente (stroke-based, 1.75px), a 24x24 por defecto.
 */
import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function IconLayoutDashboard(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

export function IconList(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export function IconUploadCloud(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 18a4.5 4.5 0 0 1-1.2-8.84A5.5 5.5 0 0 1 16.9 8.1 4 4 0 0 1 16 16" />
      <path d="M12 12v8" />
      <path d="m9 15 3-3 3 3" />
    </svg>
  );
}

export function IconFileText(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L14.5 3Z" />
      <path d="M14 3v5.5H19.5" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

export function IconCheckCircle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.3 2.3L15.5 9.5" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconAlertCircle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function IconXCircle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9.5 9.5 5 5m0-5-5 5" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconInbox(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12h4.5l1.5 3h6l1.5-3H21" />
      <path d="M5.5 5.5h13L21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6l2.5-6.5Z" />
    </svg>
  );
}

export function IconSpinner(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${props.className ?? ""}`}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconTrendUp(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m4 15 5.5-5.5 3.5 3.5L21 5" />
      <path d="M15 5h6v6" />
    </svg>
  );
}

/**
 * Marca del logo: un documento CSV con un rayo de acento (procesamiento
 * asíncrono rápido). Las líneas usan currentColor (blanco sobre el badge
 * degradado) y el rayo lleva un color ámbar sólido fijo para dar un punto
 * de color vivo, intencionalmente distinto del resto del set "outline".
 */
export function IconLogoMark(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7 3.5h7L18.5 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.5 13.2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <path
        d="M15.6 10.6 12.8 14h2.1l-1.7 3.1 3.6-3.9h-2.1l1.6-2.6Z"
        fill="#fbbf24"
        stroke="#fbbf24"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
