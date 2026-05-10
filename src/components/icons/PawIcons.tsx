import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

/** Cute paw print icon */
export function PawPrint({ size = 22, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <ellipse cx="6" cy="9" rx="2" ry="2.6" />
      <ellipse cx="18" cy="9" rx="2" ry="2.6" />
      <ellipse cx="9.5" cy="5" rx="1.7" ry="2.4" />
      <ellipse cx="14.5" cy="5" rx="1.7" ry="2.4" />
      <path d="M12 11c-3.5 0-6.2 2.5-6.2 5.5 0 2.2 1.7 3.5 3.7 3.5 1.3 0 1.7-.8 2.5-.8s1.2.8 2.5.8c2 0 3.7-1.3 3.7-3.5 0-3-2.7-5.5-6.2-5.5z" />
    </svg>
  );
}

/** Dog face icon */
export function DogFace({ size = 22, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 6c0-1.5 1-2.5 2-2.5 1 0 2 .5 2.5 1.5" />
      <path d="M19 6c0-1.5-1-2.5-2-2.5-1 0-2 .5-2.5 1.5" />
      <path d="M5 6c-1.5 1.5-2 4-2 6 0 4.5 4 8.5 9 8.5s9-4 9-8.5c0-2-.5-4.5-2-6" />
      <circle cx="9" cy="12" r="0.8" fill="currentColor" />
      <circle cx="15" cy="12" r="0.8" fill="currentColor" />
      <path d="M11 16c.5.5 1 .5 1.5.5s1 0 1.5-.5" />
      <path d="M12 14.5v.5" />
    </svg>
  );
}

/** Cat face icon */
export function CatFace({ size = 22, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4l3 6" />
      <path d="M20 4l-3 6" />
      <path d="M5 9c-1 1.5-2 3.5-2 5.5C3 18 7 21 12 21s9-3 9-6.5c0-2-1-4-2-5.5" />
      <circle cx="9" cy="13" r="0.8" fill="currentColor" />
      <circle cx="15" cy="13" r="0.8" fill="currentColor" />
      <path d="M11.5 16h1l-.5 1z" fill="currentColor" />
      <path d="M9 17.5c.5.5 1 .5 1.5.5" />
      <path d="M15 17.5c-.5.5-1 .5-1.5.5" />
    </svg>
  );
}

/** Bone icon for filters/labels */
export function Bone({ size = 22, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5.5 4a2.5 2.5 0 1 1 1.5 4.5L9 10.5 13.5 6l-2-2a2.5 2.5 0 0 1 4-2.7 2.5 2.5 0 0 1 2.7 4L20 6.5a2.5 2.5 0 0 1 2 4 2.5 2.5 0 0 1-4 2.7L16.5 15 12 19.5l2 2a2.5 2.5 0 1 1-4 2.7 2.5 2.5 0 0 1-2.7-4L4 18.5a2.5 2.5 0 0 1-2-4 2.5 2.5 0 0 1 4-2.7L7.5 9 12 4.5l-2-2a2.5 2.5 0 0 1-4.5 1.5z" opacity={0.85}/>
    </svg>
  );
}

/** Heart with paw */
export function HeartPaw({ size = 22, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
      <circle cx="9" cy="9" r="0.9" fill="currentColor" />
      <circle cx="15" cy="9" r="0.9" fill="currentColor" />
      <circle cx="11" cy="7" r="0.7" fill="currentColor" />
      <circle cx="13" cy="7" r="0.7" fill="currentColor" />
      <ellipse cx="12" cy="11" rx="1.6" ry="1.2" fill="currentColor" />
    </svg>
  );
}
