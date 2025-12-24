/**
 * @file app/robots.txt
 * @description 검색 엔진 크롤러 제어 파일
 *
 * robots.txt를 통해 검색 엔진이 어떤 페이지를 크롤링할 수 있는지 제어합니다.
 * Next.js 13+ App Router 방식으로 robots.txt를 자동 생성합니다.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from "next";

/**
 * 사이트 기본 URL
 * 프로덕션 환경에서는 환경 변수로 설정하는 것을 권장합니다.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://wholesale.farmtobiz.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/privacy",
          "/terms",
          "/sign-in/wholesaler",
        ],
        disallow: [
          "/api/", // API 라우트는 크롤링 금지
          "/admin/", // 관리자 페이지는 크롤링 금지
          "/wholesaler/", // 인증 필요한 페이지는 크롤링 금지
          "/auth-test/",
          "/check-profile/",
          "/storage-test/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

