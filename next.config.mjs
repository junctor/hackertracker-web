/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV !== "development" ? "/hackertracker-web" : "",
  assetPrefix:
    process.env.NODE_ENV !== "development" ? "/hackertracker-web" : "",
};

export default nextConfig;
