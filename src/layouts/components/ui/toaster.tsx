"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@udecode/cn";
import { Check, X } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex gap-x-3">
              <div
                className={cn(
                  "border grid place-content-center border-destructive size-5 rounded-full text-destructive ",
                  props.variant !== "destructive" &&
                    "border-success text-success",
                )}
              >
                {props.variant === "destructive" ? (
                  <X className="size-4" />
                ) : (
                  <Check className="size-4 text-success" />
                )}
              </div>
              <div className="grid gap-1">
                {title && (
                  <ToastTitle
                    className={cn(
                      props.variant === "destructive"
                        ? "text-destructive"
                        : "text-success",
                    )}
                  >
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
