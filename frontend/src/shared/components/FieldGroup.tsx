import type { ReactNode } from "react";
import { cn } from "@/shared/utils/utils";

interface FieldGroupProps {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FieldGroup({
  label,
  htmlFor,
  optional = false,
  error,
  children,
  className,
}: FieldGroupProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[#2E2E38]"
      >
        {label}
        {optional && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}