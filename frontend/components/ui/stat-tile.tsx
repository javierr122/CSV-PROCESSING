import { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "./card";

interface StatTileProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
}

const TONE_STYLES: Record<NonNullable<StatTileProps["tone"]>, string> = {
  brand: "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/30",
  success: "bg-gradient-to-br from-success-600 to-success-700 text-white shadow-md shadow-success-600/30",
  warning: "bg-gradient-to-br from-warning-600 to-warning-700 text-white shadow-md shadow-warning-600/30",
  danger: "bg-gradient-to-br from-danger-600 to-danger-700 text-white shadow-md shadow-danger-600/30",
  neutral: "bg-gradient-to-br from-gray-600 to-gray-800 text-white shadow-md shadow-gray-600/20",
};

const VALUE_STYLES: Record<NonNullable<StatTileProps["tone"]>, string> = {
  brand: "from-brand-700 to-brand-500",
  success: "from-success-700 to-success-600",
  warning: "from-warning-700 to-warning-600",
  danger: "from-danger-700 to-danger-600",
  neutral: "from-gray-900 to-gray-600",
};

export function StatTile({ label, value, icon, tone = "neutral" }: StatTileProps) {
  return (
    <Card className="group p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <div
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
            TONE_STYLES[tone]
          )}
        >
          {icon}
        </div>
      </div>
      <p
        className={clsx(
          "mt-3 bg-gradient-to-br bg-clip-text text-3xl font-bold tracking-tight text-transparent",
          VALUE_STYLES[tone]
        )}
      >
        {value}
      </p>
    </Card>
  );
}
