"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-success group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-success",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-success",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-success",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
