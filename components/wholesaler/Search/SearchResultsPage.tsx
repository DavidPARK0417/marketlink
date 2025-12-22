/**
 * @file components/wholesaler/Search/SearchResultsPage.tsx
 * @description 통합 검색 결과 페이지 메인 컴포넌트
 *
 * 검색 결과를 탭별로 표시하는 메인 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 탭 전환 (전체, 주문, 상품)
 * 2. 검색 결과 요약 표시
 * 3. 각 탭별 검색 결과 표시
 * 4. 페이지네이션 처리
 *
 * @dependencies
 * - components/wholesaler/Search/SearchTabs.tsx
 * - components/wholesaler/Search/SearchResultsSummary.tsx
 * - components/wholesaler/Search/OrderSearchResults.tsx
 * - components/wholesaler/Search/ProductSearchResults.tsx
 * - components/wholesaler/Search/EmptySearchResults.tsx
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TabsContent } from "@/components/ui/tabs";
import SearchTabs from "./SearchTabs";
import SearchResultsSummary from "./SearchResultsSummary";
import OrderSearchResults from "./OrderSearchResults";
import ProductSearchResults from "./ProductSearchResults";
import EmptySearchResults from "./EmptySearchResults";
import type { GetOrdersResult } from "@/lib/supabase/queries/orders";
import type { GetProductsResult } from "@/lib/supabase/queries/products";

interface SearchResultsPageProps {
  query: string;
  initialTab: string;
  initialPage: number;
  initialPageSize: number;
  ordersData: GetOrdersResult;
  productsData: GetProductsResult;
}

export default function SearchResultsPage({
  query,
  initialTab,
  initialPage,
  initialPageSize,
  ordersData,
  productsData,
}: SearchResultsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // URL 파라미터 동기화
  useEffect(() => {
    const tab = searchParams.get("tab") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("pageSize") || "20", 10);

    setActiveTab(tab);
    setCurrentPage(page);
    setPageSize(size);
  }, [searchParams]);

  // 탭 변경 핸들러
  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      params.set("page", "1"); // 탭 변경 시 첫 페이지로
      router.push(`/wholesaler/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`/wholesaler/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = useCallback(
    (size: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", String(size));
      params.set("page", "1"); // 페이지 크기 변경 시 첫 페이지로
      router.push(`/wholesaler/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  // 검색어 유효성 검사
  if (!query || query.length < 2) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            검색 결과
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            검색어는 최소 2자 이상 입력해주세요.
          </p>
        </div>
      </div>
    );
  }

  const totalCount = ordersData.total + productsData.total;
  const hasResults = ordersData.total > 0 || productsData.total > 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 검색 결과 요약 */}
      <SearchResultsSummary
        query={query}
        totalCount={totalCount}
        ordersCount={ordersData.total}
        productsCount={productsData.total}
        activeTab={activeTab}
      />

      {/* 탭 UI */}
      <SearchTabs
        value={activeTab}
        onValueChange={handleTabChange}
        ordersCount={ordersData.total}
        productsCount={productsData.total}
        totalCount={totalCount}
      />

      {/* 검색 결과가 없는 경우 */}
      {!hasResults && (
        <EmptySearchResults query={query} activeTab={activeTab} />
      )}

      {/* 전체 탭 */}
      {hasResults && activeTab === "all" && (
        <div className="space-y-8">
          {/* 주문 섹션 */}
          {ordersData.total > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  주문 ({ordersData.total}건)
                </h2>
              </div>
              <OrderSearchResults
                orders={ordersData.orders}
                query={query}
                total={ordersData.total}
                currentPage={1}
                pageSize={5}
                onPageChange={() => {}}
                onPageSizeChange={() => {}}
                showViewMore={true}
                maxItems={5}
              />
            </div>
          )}

          {/* 상품 섹션 */}
          {productsData.total > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  상품 ({productsData.total}건)
                </h2>
              </div>
              <ProductSearchResults
                products={productsData.products}
                query={query}
                total={productsData.total}
                currentPage={1}
                pageSize={5}
                onPageChange={() => {}}
                onPageSizeChange={() => {}}
                showViewMore={true}
                maxItems={5}
              />
            </div>
          )}
        </div>
      )}

      {/* 주문 탭 */}
      {hasResults && activeTab === "orders" && (
        <OrderSearchResults
          orders={ordersData.orders}
          query={query}
          total={ordersData.total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showViewMore={false}
        />
      )}

      {/* 상품 탭 */}
      {hasResults && activeTab === "products" && (
        <ProductSearchResults
          products={productsData.products}
          query={query}
          total={productsData.total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showViewMore={false}
        />
      )}
    </div>
  );
}
