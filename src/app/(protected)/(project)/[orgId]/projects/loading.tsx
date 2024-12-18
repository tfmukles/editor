import { Loader2 } from "lucide-react";

export default function () {
  return (
    <div className="fixed flex items-center justify-center top-0 left-0 w-full h-full">
      <Loader2 className="animate-spin size-6" />
    </div>
  );
}
