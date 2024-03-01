/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.PROTOCOL,
        hostname: process.env.HOSTNAME,
        port: process.env.PORT,
        pathname: process.env.PATHNAME,
      },
      {
        protocol: process.env.XATA_IMG_PROTOCOL,
        hostname: process.env.XATA_IMG_HOSTNAME,
        port: process.env.XATA_IMG_PORT,
        pathname: process.env.XATA_IMG_PATHNAME,
      },
    ],
  },
};

export default nextConfig;
