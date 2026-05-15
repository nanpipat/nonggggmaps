import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent/15 text-accent",
        outline: "bg-transparent border border-white/10 text-foreground/70",
        success: "bg-emerald-500/15 text-emerald-400",
        warn: "bg-amber-500/15 text-amber-400",
        dog: "bg-dog-soft text-dog",
        cat: "bg-cat-soft text-cat",
        neutral: "bg-secondary text-muted-foreground",
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
