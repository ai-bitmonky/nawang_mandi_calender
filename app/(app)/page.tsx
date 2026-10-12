import type { Metadata } from "next";
import { Suspense } from "react";
import MainView, { MainFallback } from "@/components/MainView";

export const metadata: Metadata = {
  title: { absolute: "Mandi Calendar — what is in season near you" },
  description: "Pick your state and a month. See what is in season, what is ending, what comes next and what is trucked in from far, with dishes to cook.",
};

export default function HomePage() {
  return (
    <Suspense fallback={<MainFallback />}>
      <MainView />
    </Suspense>
  );
}
