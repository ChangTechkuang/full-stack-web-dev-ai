"use client";

import * as React from "react";
import { cn } from "@/shared/lib/cn";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none text-text-primary", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";
