/**
 * @file app/manifest.ts
 * @description FarmToBiz 도매 웹앱 PWA 매니페스트 설정.
 *
 * 주요 설정:
 * - 브랜드명/짧은 이름/설명 정의
 * - 시작 URL 및 scope를 루트("/")로 지정
 * - display: standalone로 앱처럼 보이도록 설정
 * - 브랜드 프라이머리 색상(#10B981)을 theme_color로 사용
 * - 제공된 아이콘 세트를 manifest에 연결
 *
 * @see public/icons/* - PWA 아이콘 소스
 */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FarmToBiz-Wholesaler",
    short_name: "FarmToBiz",
    description:
      "전국 소매업체와 연결되는 FarmToBiz 도매 전용 플랫폼. 상품 등록부터 주문·정산 관리까지 한 곳에서 처리하세요.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#10B981",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}

