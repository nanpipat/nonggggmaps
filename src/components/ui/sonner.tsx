"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg shadow-soft-lg border-2 border-foreground bg-card text-card-foreground p-3.5 text-sm",
          title: "font-black",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground rounded-md border-2 border-foreground",
          cancelButton: "bg-muted text-foreground rounded-md border-2 border-foreground",
          success: "border-foreground bg-emerald-200 text-foreground",
          error: "border-foreground bg-rose-200 text-foreground",
        },
      }}
    />
  );
}
