/**
 * @file app/wholesaler/search/page.tsx
 * @description 통합 검색 결과 페이지
 *
 * 주문, 상품을 통합 검색하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 주문 검색 (고객명, 주문번호)
 * 2. 상품 검색 (상품명)
 * 3. 탭별 결과 표시 (전체, 주문, 상품)
 * 4. 서버 사이드 페이지네이션
 *
 * @dependencies
 * - lib/supabase/queries/orders.ts
 * - lib/supabase/queries/products.ts
 * - components/wholesaler/Search/SearchResultsPage.tsx
 */

import { Suspense } from "react";
import { getOrders } from "@/lib/supabase/queries/orders";
import { getProducts } from "@/lib/supabase/queries/products";
import SearchResultsPage from "@/components/wholesaler/Search/SearchResultsPage";
import { SearchResultsPageSkeleton } from "@/components/wholesaler/Search/SearchResultsPageSkeleton";

/**
 * 검색어 타입 판별 함수
 */
function detectSearchType(query: string): "order" | "all" {
  const trimmed = query.trim();
  
  // 주문번호 패턴: ORD-로 시작하거나 숫자-숫자-숫자-숫자 패턴
  if (/^ORD-/.test(trimmed) || /^\d{4}-\d{2}-\d{2}-\d+/.test(trimmed)) {
    return "order";
  }
  
  return "all";
}

/**
 * 통합 검색 결과 페이지 (서버 컴포넌트)
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tab?: string;
    page?: string;
    pageSize?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const tab = params.tab || "all";
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = parseInt(params.pageSize ?? "20", 10);

  // 검색어 유효성 검사
  if (!query || query.length < 2) {
    return (
      <Suspense fallback={<SearchResultsPageSkeleton />}>
        <SearchResultsPage
          query={query}
          initialTab={tab}
          initialPage={page}
          initialPageSize={pageSize}
          ordersData={{
            orders: [],
            total: 0,
            page: 1,
            pageSize,
            totalPages: 0,
            counts: {
              all: 0,
              pending: 0,
              confirmed: 0,
              shipped: 0,
              completed: 0,
              cancelled: 0,
              processing: 0,
            },
          }}
          productsData={{
            products: [],
            total: 0,
            page: 1,
            pageSize,
            totalPages: 0,
          }}
        />
      </Suspense>
    );
  }

  // 검색어 타입 판별
  const searchType = detectSearchType(query);
  
  // 주문번호 패턴이면 주문 탭으로 초기화
  const initialTab = searchType === "order" ? "orders" : tab;

  // 검색 필터 구성
  const orderFilter: {
    order_number?: string;
    customer_name?: string;
  } = {};

  const productFilter: {
    search?: string;
  } = {};

  if (searchType === "order") {
    // 주문번호 검색
    orderFilter.order_number = query;
  } else {
    // 고객명 검색 (주문)
    orderFilter.customer_name = query;
    // 상품명 검색
    productFilter.search = query;
  }

  // 병렬 검색 실행
  let ordersData;
  let productsData;

  try {
    // 주문 검색 (전체 탭 또는 주문 탭일 때만)
    if (initialTab === "all" || initialTab === "orders") {
      ordersData = await getOrders({
        page: initialTab === "orders" ? page : 1,
        pageSize: initialTab === "orders" ? pageSize : 5, // 전체 탭에서는 5개만
        filter: orderFilter,
      });
    } else {
      ordersData = {
        orders: [],
        total: 0,
        page: 1,
        pageSize: 5,
        totalPages: 0,
        counts: {
          all: 0,
          pending: 0,
          confirmed: 0,
          shipped: 0,
          completed: 0,
          cancelled: 0,
          processing: 0,
        },
      };
    }

    // 상품 검색 (전체 탭 또는 상품 탭일 때만)
    if (initialTab === "all" || initialTab === "products") {
      productsData = await getProducts({
        page: initialTab === "products" ? page : 1,
        pageSize: initialTab === "products" ? pageSize : 5, // 전체 탭에서는 5개만
        filter: productFilter,
      });
    } else {
      productsData = {
        products: [],
        total: 0,
        page: 1,
        pageSize: 5,
        totalPages: 0,
      };
    }
  } catch (error) {
    console.error("❌ [search-page] 검색 실패:", error);
    
    // 에러 발생 시 빈 데이터 반환
    ordersData = {
      orders: [],
      total: 0,
      page: 1,
      pageSize: initialTab === "orders" ? pageSize : 5,
      totalPages: 0,
      counts: {
        all: 0,
        pending: 0,
        confirmed: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0,
        processing: 0,
      },
    };

    productsData = {
      products: [],
      total: 0,
      page: 1,
      pageSize: initialTab === "products" ? pageSize : 5,
      totalPages: 0,
    };
  }

  console.log("🔍 [search-page] 검색 완료", {
    query,
    searchType,
    initialTab,
    ordersCount: ordersData.orders.length,
    productsCount: productsData.products.length,
  });

  return (
    <Suspense fallback={<SearchResultsPageSkeleton />}>
      <SearchResultsPage
        query={query}
        initialTab={initialTab}
        initialPage={page}
        initialPageSize={pageSize}
        ordersData={ordersData}
        productsData={productsData}
      />
    </Suspense>
  );
}
