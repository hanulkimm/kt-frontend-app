/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_DATA_API_KEY: process.env.NEXT_PUBLIC_DATA_API_KEY,
    KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
    NEXT_PUBLIC_KAKAO_MAP_API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY,
  },
};

export default nextConfig;