/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || "",
  trailingSlash: true,
  images: {
    domains: ['localhost'],
    unoptimized: true, // Required for static export
  },
  transpilePackages: [
    "@heroui/theme",
    "@heroui/system",
    "@heroui/button",
    "@heroui/code",
    "@heroui/input",
    "@heroui/kbd",
    "@heroui/link",
    "@heroui/listbox",
    "@heroui/navbar",
    "@heroui/snippet",
    "@heroui/switch"
  ]
}

module.exports = nextConfig