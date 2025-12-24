/**
 * @file lib/metadata/product.ts
 * @description 상품 관련 메타데이터 생성 함수
 *
 * 상품 페이지에서 사용하는 동적 메타데이터를 생성합니다.
 *
 * @dependencies
 * - lib/metadata/index.ts
 * - lib/supabase/queries/products.ts
 * - types/product.ts
 */

import type { Metadata } from "next";
import { getProductById } from "@/lib/supabase/queries/products";
import { createProductMetadata } from "./index";

/**
 * 상품 상세 페이지용 메타데이터 생성
 *
 * Next.js의 generateMetadata에서 사용합니다.
 * 같은 API를 호출해도 Next.js가 자동으로 캐싱하여 성능 저하가 없습니다.
 *
 * @param productId 상품 ID
 * @returns Metadata 객체 또는 null (상품이 없을 경우)
 *
 * @example
 * ```tsx
 * export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *   const metadata = await generateProductMetadata(params.id);
 *   return metadata || { title: "상품 없음" };
 * }
 * ```
 */
export async function generateProductMetadata(
  productId: string,
): Promise<Metadata | null> {
  console.log("📄 [metadata] 상품 메타데이터 생성 시작", { productId });

  try {
    // 상품 데이터 조회 (Next.js가 자동으로 캐싱)
    const product = await getProductById(productId);

    if (!product) {
      console.log("⚠️ [metadata] 상품 없음:", productId);
      return null;
    }

    // 상품 설명이 없으면 기본값 사용
    const description =
      product.description ||
      `${product.name} - ${product.category} 카테고리 상품입니다. 가격: ${product.price.toLocaleString()}원`;

    // 이미지가 있으면 첫 번째 이미지 사용, 없으면 기본 이미지
    const imageUrl = product.images?.[0] || product.image_url || undefined;

    console.log("✅ [metadata] 상품 메타데이터 생성 완료", {
      productId,
      title: product.name,
    });

    return createProductMetadata(product.name, description, imageUrl, productId);
  } catch (error) {
    console.error("❌ [metadata] 상품 메타데이터 생성 실패:", error);
    // 에러 발생 시 기본 메타데이터 반환
    return {
      title: "상품 정보 - FarmToBiz",
      description: "상품 정보를 불러올 수 없습니다.",
    };
  }
}

