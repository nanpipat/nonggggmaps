"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange?: (n: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

const sizes = {
  sm: "size-3.5",
  md: "size-5",
  lg: "size-8",
};

export function RatingStars({ value, onChange, size = "md", readOnly = false }: Props) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(n)}
            onClick={() => !readOnly && onChange?.(n)}
            className={cn("transition-transform", !readOnly && "hover:scale-110 active:scale-95")}
            aria-label={`${n} ดาว`}
          >
            <Star
              className={cn(
                sizes[size],
                filled ? "fill-amber-400 text-amber-400" : "text-white/15",
              )}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
