import * as React from "react";
import { cn } from "@/shared/lib/cn";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "brand";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-bg-subtle text-text-secondary border-border-default",
  info: "bg-state-info/10 text-state-info border-state-info/30",
  success: "bg-state-success/10 text-state-success border-state-success/30",
  warning: "bg-state-warning/10 text-state-warning border-state-warning/30",
  danger: "bg-state-error/10 text-state-error border-state-error/30",
  brand: "bg-brand/10 text-brand border-brand/30",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}
