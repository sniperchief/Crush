"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders fixed-position layers on <body>, outside the stage wrapper whose
 * transform/filter transitions would otherwise become their containing block.
 * Only used by stages that never render on the server.
 */
export function Portal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
