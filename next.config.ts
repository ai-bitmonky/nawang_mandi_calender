import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /* the OG image reads its font from disk when it re-renders each day */
  outputFileTracingIncludes: { "/opengraph-image": ["./app/fonts/*.woff"] },
};

export default nextConfig;
