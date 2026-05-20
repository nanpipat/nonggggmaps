import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border-2 px-2.5 py-0.5 text-xs font-black transition-colors",
  {
    variants: {
      variant: {
        default: "border-foreground bg-primary-soft text-foreground",
        secondary: "border-foreground bg-secondary text-secondary-foreground",
        accent: "border-foreground bg-accent text-accent-foreground",
        outline: "border-foreground bg-card text-foreground",
        success: "border-foreground bg-emerald-200 text-foreground",
        warn: "border-foreground bg-secondary text-secondary-foreground",
        dog: "border-foreground bg-dog-soft text-foreground",
        cat: "border-foreground bg-cat-soft text-foreground",
        neutral: "border-foreground bg-muted text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
