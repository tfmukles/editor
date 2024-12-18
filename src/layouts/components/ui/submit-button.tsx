import { cn } from "@udecode/cn";
import { VariantProps } from "class-variance-authority";
import { Loader } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button, buttonVariants } from "./button";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export default function SubmitButton({
  variant,
  children,
  className,
  disabled,
}: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      variant={variant}
      disabled={pending || disabled}
      className={cn("text-primary w-full rounded-full mt-6", className)}
    >
      {children}
      {(pending || disabled) && (
        <Loader className="animate-spin ml-2 h-4 w-4" />
      )}
    </Button>
  );
}
