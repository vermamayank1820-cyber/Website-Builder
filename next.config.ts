import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Keep pdf.js out of the server bundle so its internal worker module
  // (pdf.worker.mjs) resolves from node_modules at runtime instead of a
  // relocated Turbopack chunk. mammoth likewise prefers running un-bundled.
  serverExternalPackages: ["pdfjs-dist", "mammoth", "pdf-to-img", "tesseract.js", "@napi-rs/canvas"],
};

export default nextConfig;
