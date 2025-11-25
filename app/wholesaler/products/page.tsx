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
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/wholesaler/Products/ProductTable";
import { ProductTableSkeleton } from "@/components/wholesaler/Products/ProductTableSkeleton";
import { getProducts } from "@/lib/supabase/queries/products";

/**
 * 상품 목록 페이지 (서버 컴포넌트)
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
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
  const category = params.category;
  const status = params.status; // "active" | "inactive" | undefined
  const search = params.search;
  const sortBy = (params.sortBy as "created_at" | "price" | "name") ?? "created_at";
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
      pageSize: 10,
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
      pageSize: 10,
      totalPages: 0,
    };
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="상품 관리"
        description="등록한 상품을 관리하고 수정하세요."
        actions={
          <Button asChild>
            <Link href="/wholesaler/products/new">
              <Plus className="mr-2 h-4 w-4" />
              상품 등록
            </Link>
          </Button>
        }
      />

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
