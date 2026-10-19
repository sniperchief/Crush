import type { SVGProps } from "react";

/** Four-point star used throughout the experience. */
export const SPARKLE_PATH =
  "M12 0C12.7 6.4 17.6 11.3 24 12C17.6 12.7 12.7 17.6 12 24C11.3 17.6 6.4 12.7 0 12C6.4 11.3 11.3 6.4 12 0Z";

export function Sparkle({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className} {...props}>
      <path d={SPARKLE_PATH} fill="currentColor" />
    </svg>
  );
}
