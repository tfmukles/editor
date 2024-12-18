"use client";

import { cn } from "@udecode/cn";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Icons } from "./ui/icons";
import { Input } from "./ui/input";

export default function Search({
  disabled,
  className,
  onChange,
  value = "",
  isLoading,
}: {
  disabled?: boolean;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  isLoading?: boolean;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const params = useSearchParams();

  function handleSearch(term: string) {
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.delete("page");
      params.set("q", term);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={cn("relative", className)}>
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="overflow-hidden relative h-full">
        <div
          className={cn(
            "pointer-events-none absolute overflow-hidden flex w-14 items-center rounded-tl-lg rounded-bl-lg bg-light top-px left-px max-h-[calc(100%_-_2px)] h-full",
            className,
          )}
          aria-hidden="true"
        >
          <Icons.search className="size-6 mx-auto" aria-hidden="true" />
        </div>
        <Input
          type="text"
          name="search"
          {...(value && { value })}
          id="search"
          disabled={disabled}
          className="w-full h-[46px] pl-16"
          placeholder="Search by file name..."
          spellCheck={false}
          defaultValue={params.get("q") || ""}
          onChange={(e) => {
            if (onChange) onChange(e);
            else handleSearch(e.target.value);
          }}
        />
      </div>

      {(isLoading || isPending) && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
