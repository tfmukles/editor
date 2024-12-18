import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="text-center w-full h-screen flex">
      <Loader2 className="m-auto animate-spin size-7" />
    </div>
  );
}
