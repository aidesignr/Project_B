import * as React from "react";
import { cn } from "@/lib/utils";

/** Static placeholder block (no pulse: 08-accessibility, no pulsing or flashing). */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" aria-hidden className={cn("rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
