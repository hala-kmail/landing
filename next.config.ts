import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Cache Components (and its partial prefetching) stay off: the page has no data to
  // cache, and with them on it could not be exported as plain static files. To deploy
  // to a static host, add `output: "export"` here; `npm run build` then writes `out/`.

  // The project root is this folder. Pinned, because Next looks for lockfiles in the folders
  // above it too, and a stray one there (in a home folder, say) is otherwise reported.
  turbopack: {
    root: path.resolve(__dirname),
  },

  experimental: {
    // The light palette's oklch() values ship exactly as written. By default the minifier
    // (Lightning CSS) rewrites them as lab() with hex fallbacks for Firefox 111-112; the
    // page already needs color-mix(), which arrived in Firefox 113 together with oklch().
    lightningCssFeatures: { exclude: ["oklab-colors"] },
  },
};

export default nextConfig;
