/**
 * @file app/wholesaler/products/page.tsx
 * @description 상품 목록 페이지
 *
 * 도매점의 상품 목록을 표시하고 관리하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 상품 목록 표시 (테이블)
 * 2. 필터링 (카테고리, 활성/비활성, 검색)
 * 3. 정렬 및 페이지네이션
 * 4. 상품 활성화/비활성화 토글
 * 5. 상품 수정/삭제
 *
 * @dependencies
 * - lib/supabase/queries/products.ts
 * - components/wholesaler/Products/ProductTable.tsx
 * - components/common/PageHeader.tsx
 */

import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ProductTable } from "@/components/wholesaler/Products/ProductTable";
import { ProductTableSkeleton } from "@/components/wholesaler/Products/ProductTableSkeleton";
import { getProducts } from "@/lib/supabase/queries/products";

/**
 * 인증이 필요한 페이지이므로 검색 엔진 인덱싱 방지
 */
export const metadata: Metadata = {
  title: "상품 관리 - FarmToBiz",
  description: "도매 상품 관리 페이지",
  robots: "noindex, nofollow",
};

/**
 * 상품 목록 페이지 (서버 컴포넌트)
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    category?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}) {
  const params = await searchParams;

  // 쿼리 파라미터 파싱
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = parseInt(params.pageSize ?? "20", 10);
  const category = params.category;
  const status = params.status; // "active" | "inactive" | undefined
  const search = params.search;
  const sortBy =
    (params.sortBy as "created_at" | "price" | "name") ?? "created_at";
  const sortOrder = (params.sortOrder as "asc" | "desc") ?? "desc";

  // 필터 구성
  const filter: {
    category?: string;
    is_active?: boolean;
    search?: string;
  } = {};

  if (category) {
    filter.category = category;
  }

  if (status === "active") {
    filter.is_active = true;
  } else if (status === "inactive") {
    filter.is_active = false;
  }

  if (search) {
    filter.search = search;
  }

  // 상품 목록 조회
  let productsData;
  try {
    productsData = await getProducts({
      page,
      pageSize,
      sortBy,
      sortOrder,
      filter,
    });
  } catch (error) {
    console.error("❌ [products-page] 상품 목록 조회 실패:", error);
    // 에러 발생 시 빈 데이터 반환
    productsData = {
      products: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 0,
    };
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 페이지 헤더 - 디자인 핸드오프 스타일 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            상품 관리
          </h1>
          <p className="mt-2 text-sm lg:text-base text-muted-foreground">
            등록된 상품 {productsData.total}개를 관리하세요.
          </p>
        </div>
        <Link
          href="/wholesaler/products/new"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-5 lg:px-6 py-3 rounded-xl font-semibold hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] transition-all duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          <span>상품 등록</span>
        </Link>
      </div>

      <Suspense fallback={<ProductTableSkeleton />}>
        <ProductTable
          initialData={productsData}
          initialFilters={{
            category,
            status,
            search,
            sortBy,
            sortOrder,
          }}
        />
      </Suspense>
    </div>
  );
}
