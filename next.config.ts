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
  output: "standalone",
  allowedDevOrigins: getAllowedDevOrigins(),
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
