/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // serverless: the twin seeds from farm.config.yaml at runtime — make sure the
  // file is traced into every function bundle (pages + API routes).
  outputFileTracingIncludes: {
    "/**": ["./farm.config.yaml"],
  },
};

export default nextConfig;
