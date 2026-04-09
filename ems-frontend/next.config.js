/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'amzn-s3-cn-devprojects.s3.ap-south-1.amazonaws.com' },
    ],
  },
};

module.exports = nextConfig;
