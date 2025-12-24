/**
 * @file lib/metadata/index.ts
 * @description 메타데이터 생성 유틸리티 함수
 *
 * SEO를 위한 동적 메타데이터를 생성하는 공통 함수들을 제공합니다.
 * 각 페이지에서 재사용 가능한 메타데이터 생성 로직을 모아둡니다.
 *
 * @dependencies
 * - next/metadata (Metadata 타입)
 */

import type { Metadata } from "next";

/**
 * 기본 사이트 정보
 */
const SITE_NAME = "FarmToBiz";
const SITE_DESCRIPTION = "도매 사업자 전용 플랫폼";
const DEFAULT_OG_IMAGE = "/og-image.png";

/**
 * 사이트 기본 URL
 * 프로덕션 환경에서는 환경 변수로 설정하는 것을 권장합니다.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://wholesale.farmtobiz.com";

/**
 * 기본 메타데이터 생성 함수
 *
 * @param title 페이지 제목
 * @param description 페이지 설명
 * @param options 추가 옵션 (이미지, URL 등)
 * @returns Metadata 객체
 */
export function createMetadata(
  title: string,
  description: string,
  options?: {
    image?: string | string[];
    url?: string;
    type?: "website" | "article";
    noIndex?: boolean; // 검색 엔진 인덱싱 방지 (개발/비공개 페이지용)
    canonical?: string; // Canonical URL (상대 경로 또는 절대 URL)
  },
): Metadata {
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} - ${SITE_NAME}`;

  // 이미지 처리: 배열이면 첫 번째, 문자열이면 그대로, 없으면 기본값
  const ogImages = options?.image
    ? Array.isArray(options.image)
      ? options.image
      : [options.image]
    : [DEFAULT_OG_IMAGE];

  // Canonical URL 처리
  // 상대 경로인 경우 절대 URL로 변환, 이미 절대 URL이면 그대로 사용
  const canonicalUrl = options?.canonical
    ? options.canonical.startsWith("http")
      ? options.canonical
      : `${SITE_URL}${options.canonical.startsWith("/") ? "" : "/"}${options.canonical}`
    : options?.url || undefined;

  return {
    title: fullTitle,
    description,
    // robots: 검색 엔진 인덱싱 제어
    robots: options?.noIndex ? "noindex, nofollow" : "index, follow",
    // Canonical URL: 중복 콘텐츠 방지
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    // Open Graph: 소셜 미디어 공유용
    openGraph: {
      title: fullTitle,
      description,
      url: options?.url || canonicalUrl,
      siteName: SITE_NAME,
      images: ogImages.map((img) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: title,
      })),
      type: options?.type || "website",
      locale: "ko_KR",
    },
    // Twitter Card: 트위터 공유용
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImages,
    },
  };
}

/**
 * 상품 페이지용 메타데이터 생성
 *
 * @param productName 상품명
 * @param productDescription 상품 설명
 * @param productImage 상품 이미지 URL
 * @param productId 상품 ID (canonical URL 생성용)
 * @returns Metadata 객체
 */
export function createProductMetadata(
  productName: string,
  productDescription: string,
  productImage?: string,
  productId?: string,
): Metadata {
  return createMetadata(
    productName,
    productDescription || `${productName} 상품 정보`,
    {
      image: productImage,
      type: "article",
      canonical: productId ? `/wholesaler/products/${productId}/edit` : undefined,
    },
  );
}

/**
 * 주문 페이지용 메타데이터 생성
 *
 * @param orderNumber 주문번호
 * @returns Metadata 객체
 */
export function createOrderMetadata(orderNumber: string): Metadata {
  return createMetadata(
    `주문 ${orderNumber}`,
    `주문번호 ${orderNumber}의 상세 정보를 확인하세요.`,
    {
      noIndex: true, // 주문 정보는 검색 엔진에 노출하지 않음
    },
  );
}

