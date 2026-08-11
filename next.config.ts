import type { NextConfig } from "next";

function getAllowedDevOrigins(): string[] {
  const origins = new Set<string>(["127.0.0.1", "localhost"]);

  const appUrl = process.env.APP_URL;
  if (appUrl) {
    try {
      origins.add(new URL(appUrl).hostname);
    } catch {
      // ignore invalid APP_URL
    }
  }

  // Allow common office LAN ranges during local development.
  origins.add("192.168.**");
  origins.add("10.**");

  return [...origins];
}

const nextConfig: NextConfig = {
  // Standalone is for Docker only — breaks Vercel builds on Next.js 16.3+ (see vercel/next.js#96646).
  output: process.env.VERCEL ? undefined : "standalone",
  allowedDevOrigins: getAllowedDevOrigins(),
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
