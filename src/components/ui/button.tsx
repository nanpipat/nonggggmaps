"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border-2 border-foreground text-sm font-black ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-x-1 active:translate-y-1 active:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground shadow-soft hover:-translate-x-0.5 hover:-translate-y-0.5",
        outline: "bg-card text-foreground shadow-soft hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground shadow-soft hover:-translate-x-0.5 hover:-translate-y-0.5",
        ghost: "border-transparent shadow-none hover:border-foreground hover:bg-muted hover:shadow-soft",
        soft: "bg-primary-soft text-foreground shadow-soft hover:-translate-x-0.5 hover:-translate-y-0.5",
        link: "border-transparent text-primary underline-offset-4 shadow-none hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3 text-[13px] rounded-md",
        lg: "h-12 px-7 text-base rounded-lg",
        icon: "size-11 rounded-lg",
        pill: "h-10 px-5 rounded-lg text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
