import { Suspense } from "react";
import AppShell, { ShellFallback } from "@/components/AppShell";

/* The app reads its state from the URL, so it renders in the browser; the fallback is the static HTML. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellFallback>{children}</ShellFallback>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
