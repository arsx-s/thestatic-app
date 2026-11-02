/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@the-static/shared-types",
    "@the-static/api-client",
    "@the-static/validation",
    "@the-static/design-system",
  ],
  images: {
    domains: ["ogibtculbretwbrqvsvw.supabase.co"],
  },
}

module.exports = nextConfig
