/**
 * @file next.config.ts
 * @description Next.js 설정 파일. 이미지 원본 허용 및 프로덕션 번들에서 불필요한 콘솔 제거 설정을 관리합니다.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "picsum.photos" },
      { hostname: "images.unsplash.com" },
      {
        hostname: "fmqaxnuemcmcjjgodath.supabase.co",
        protocol: "https",
      },
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },
};

export default nextConfig;
