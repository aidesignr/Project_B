import type { ReactNode } from "react";
import { FeatureCarousel } from "./FeatureCarousel";
import { Toolbar } from "./Toolbar";

/** Split screen: feature pane (start) + 400px form column (end). */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-2 bg-background text-foreground">
      <FeatureCarousel />
      <main className="flex min-w-0 flex-col gap-8 px-6 pt-6 pb-8">
        <Toolbar />
        <div className="flex grow items-center justify-center">
          <div className="flex w-full max-w-100 flex-col gap-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
