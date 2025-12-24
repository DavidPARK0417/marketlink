/**
 * @file app/sitemap.ts
 * @description SEO를 위한 사이트맵 생성
 *
 * Next.js 13+ App Router 방식으로 sitemap.xml을 자동 생성합니다.
 * 검색 엔진이 사이트 구조를 파악하고 크롤링할 수 있도록 도와줍니다.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
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

export default function sitemap(): MetadataRoute.Sitemap {
  // 공개적으로 접근 가능한 페이지만 포함
  // 인증이 필요한 페이지는 제외 (개인정보 보호)
  const publicPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/sign-in/wholesaler`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  return publicPages;
}

