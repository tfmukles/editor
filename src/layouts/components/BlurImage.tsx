import { cn } from "@udecode/cn";
import Image from "next/image";
import { ComponentProps, forwardRef, useState } from "react";

type ImageProps = Omit<ComponentProps<typeof Image>, "src">;

type Props = ImageProps & { src: string };

const BlurImage = forwardRef<HTMLImageElement, Props>(
  ({ src, className }, ref) => {
    const [isLoading, setLoading] = useState(true);
    const [isError, setError] = useState(false);
    const fallBackImage = "/images/404.jpg";

    return (
      <img
        ref={ref}
        src={isError ? fallBackImage : src}
        alt="Image"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(
          `inset-0 absolute w-full h-full duration-700 ease-in-out object-contain inline group-hover:opacity-70 ${
            isLoading
              ? "scale-100 blur-2xl grayscale-0"
              : "scale-100 blur-0 grayscale-0"
          }`,
          className,
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          if (src) {
            setError(true);
          }
        }}
      />
    );
  },
);

export default BlurImage;
