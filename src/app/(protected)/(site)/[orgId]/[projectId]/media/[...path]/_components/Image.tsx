"use client";

import LoadImage from "@/partials/LoadImage";
import { cn } from "@udecode/cn";
import { useState } from "react";

export default function Image({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const [isImageLoaded, setLoading] = useState(true);

  return (
    <LoadImage lazy path={src}>
      {({ src, ref }) => {
        return (
          <img
            loading="lazy"
            ref={ref}
            src={src}
            alt="image"
            className={cn(
              "inset-0 absolute w-full h-full duration-700 ease-in-out object-contain inline bg-light group-hover:opacity-70",
              className,
              isImageLoaded
                ? "blur-2xl scale-100"
                : "blur-0 grayscale-0 bg-transparent",
            )}
            onLoad={() => setLoading(false)}
          />
        );
      }}
    </LoadImage>
  );
}
