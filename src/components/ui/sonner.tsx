"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl shadow-soft-lg border border-border bg-card text-card-foreground p-3.5 text-sm",
          title: "font-semibold",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground rounded-lg",
          cancelButton: "bg-muted text-muted-foreground rounded-lg",
          success: "border-emerald-200 bg-emerald-50 text-emerald-900",
          error: "border-rose-200 bg-rose-50 text-rose-900",
        },
      }}
    />
  );
}
