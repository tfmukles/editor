import { SubmitFormState } from "@/actions/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";

export default function FormError({
  error: errors,
  isError = false,
  message,
}: Partial<SubmitFormState<any>>) {
  const [error, setError] = useState<
    {
      path: string;
      message: string;
    }[]
  >(errors || []);

  useEffect(() => {
    if (isError && errors?.length === 0) {
      setError([
        {
          path: "",
          message: message || "Something went wrong",
        },
      ]);
    } else {
      setError(errors || []);
    }
  }, [errors]);

  if (!error || error?.length === 0) return null;

  return (
    <ul className="grid gap-3 bg-destructive/10  text-destructive/80 p-3 rounded-lg">
      {error.map((err, index) => (
        <li
          key={index}
          className="flex font-semibold items-center space-x-2 text-sm relative"
        >
          <Icons.warning />
          <span className="flex-1">{err.message}</span>
          <div>
            <Button
              variant={"basic"}
              className="border flex items-center justify-center border-destructive rounded-full flex-none size-6"
              size={"icon"}
              onClick={() => setError(error.filter((_, i) => i !== index))}
            >
              <X className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
