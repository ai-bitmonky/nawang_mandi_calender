import type { Metadata } from "next";
import Showcase from "@/components/showcase/Showcase";

export const metadata: Metadata = {
  title: "Showcase — one app on a phone and a desktop",
  description: "What is growing near you, month by month, for every state in India. One app shown on a phone and a desktop.",
};

export default function ShowcasePage() {
  return <Showcase />;
}
