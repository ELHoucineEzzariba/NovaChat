import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

interface FormMessageProps {
  variant: "error" | "success";
  children: ReactNode;
}

export function FormMessage({ variant, children }: FormMessageProps) {
  const Icon = variant === "error" ? AlertCircle : CheckCircle2;
  const colorClass = variant === "error" ? "text-danger" : "text-online";

  return (
    <p className={`flex items-center gap-1.5 text-sm ${colorClass}`}>
      <Icon size={14} className="shrink-0" />
      {children}
    </p>
  );
}
