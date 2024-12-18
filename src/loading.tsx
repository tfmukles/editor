import { Loader2 } from "lucide-react";

export default function () {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
