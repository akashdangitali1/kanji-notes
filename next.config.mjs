/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb', // scanned PDFs from a phone camera can be large
    },
  },
};

export default nextConfig;
