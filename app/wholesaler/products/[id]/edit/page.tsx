/**
 * @file app/wholesaler/products/[id]/edit/page.tsx
 * @description 상품 수정 페이지
 *
 * 도매점 상품을 수정하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 상품 ID로 기존 데이터 조회
 * 2. ProductForm 컴포넌트를 사용한 상품 수정 폼
 * 3. 이미지 업로드 처리
 * 4. products 테이블에 데이터 UPDATE
 * 5. 성공 시 상품 목록 페이지로 리다이렉트
 *
 * @dependencies
 * - components/wholesaler/Products/ProductForm.tsx
 * - actions/wholesaler/update-product.ts
 * - lib/supabase/queries/products.ts (getProductById)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - types/product.ts
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById } from "@/lib/supabase/queries/products";
import { generateProductMetadata } from "@/lib/metadata/product";
import EditProductClient from "./edit-product-client";

/**
 * 동적 메타데이터 생성
 *
 * Next.js가 자동으로 이 함수를 호출하여 SEO 메타데이터를 생성합니다.
 * 같은 getProductById를 호출해도 Next.js가 캐싱하여 성능 저하가 없습니다.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const metadata = await generateProductMetadata(id);

  // 상품이 없거나 메타데이터 생성 실패 시 기본값 반환
  return (
    metadata || {
      title: "상품 수정 - FarmToBiz",
      description: "상품 정보를 수정할 수 없습니다.",
    }
  );
}

/**
 * 상품 수정 페이지 (Server Component)
 *
 * Next.js 15의 await params를 사용하여 상품 ID를 받아옵니다.
 * 서버에서 상품 데이터를 먼저 조회하고, 존재하지 않으면 notFound()를 호출합니다.
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15: params는 Promise이므로 await 필요
  const { id } = await params;

  console.group("📝 [edit-product-page] 상품 수정 페이지 접근");
  console.log("productId:", id);

  try {
    // 1. 상품 데이터 조회
    const product = await getProductById(id);

    if (!product) {
      console.log("⚠️ [edit-product-page] 상품 없음:", id);
      console.groupEnd();
      notFound();
    }

    console.log("✅ [edit-product-page] 상품 조회 완료:", product.id);
    console.groupEnd();

    // 2. Client Component로 전달
    return <EditProductClient product={product} />;
  } catch (error) {
    console.error("❌ [edit-product-page] 상품 조회 예외:", error);
    console.groupEnd();
    notFound();
  }
}

