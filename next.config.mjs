/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh", 
        pathname: "/f/**",
      },
    ],
  },
  serverExternalPackages: ["@node-rs/argon2"],
};
 
export default nextConfig;
 