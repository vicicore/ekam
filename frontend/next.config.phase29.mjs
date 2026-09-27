// Merge this into the existing next.config.mjs instead of replacing it
// blindly. The standalone output is required by the Phase 29 frontend image.

const nextConfig = {
  output: "standalone",
};

export default nextConfig;
