import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const useSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("q", e.target.value);
    setSearch(e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };
};
