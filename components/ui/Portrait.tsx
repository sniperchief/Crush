"use client";

import { useState } from "react";
import Image from "next/image";

/** Her photo from /public/amarachi.jpg, with a monogram fallback if it's missing. */
export function Portrait({ className = "" }: { className?: string }) {
  const [missing, setMissing] = useState(false);

  return (
    <div className={`chrome-ring relative aspect-[4/5] overflow-hidden rounded-xl bg-[#1a1216] ${className}`}>
      {missing ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="chrome-text font-display text-7xl leading-none">A</span>
        </div>
      ) : (
        <Image
          src="/amarachi.jpg"
          alt="Amarachi"
          fill
          sizes="240px"
          quality={85}
          onError={() => setMissing(true)}
          // Full-length studio shot: zoom to head-and-shoulders, away from the watermark.
          className="origin-[48%_24%] scale-[1.85] object-cover object-[50%_20%]"
        />
      )}
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />
    </div>
  );
}
