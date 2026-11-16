import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR lets a verification build run without clobbering a running dev server's .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // allow opening the dev server from LAN / Tailscale addresses
  allowedDevOrigins: ["192.168.100.10", "192.168.100.11", "100.71.189.109", "*.local"],
  serverExternalPackages: ["@electric-sql/pglite", "pg", "sharp"],
  // bundled images: let browsers cache them for a week
  async headers() {
    return [{ source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] }];
  },
  experimental: {
    serverActions: { bodySizeLimit: "30mb" }, // admin photo uploads
  },
};

export default nextConfig;
