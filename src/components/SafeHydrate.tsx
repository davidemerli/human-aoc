import type { ReactNode } from "react";

export const SafeHydrate = ({ children }: { children: ReactNode }) => {
  return (
    <div suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
};
