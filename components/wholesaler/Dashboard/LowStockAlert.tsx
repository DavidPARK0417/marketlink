/**
 * @file components/wholesaler/Dashboard/LowStockAlert.tsx
 * @description 재고 부족 알림 컴포넌트
 *
 * 재고가 10개 이하인 상품을 표시하고 재고 추가 버튼을 제공합니다.
 *
 * @dependencies
 * - app/api/wholesaler/dashboard/low-stock/route.ts
 * - components/ui/card.tsx
 * - components/ui/button.tsx
 * - components/common/EmptyState.tsx
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import EmptyState from "@/components/common/EmptyState";
import { AlertCircle, Package, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/product";

/**
 * 재고 부족 상품 조회 함수
 */
async function fetchLowStockProducts(): Promise<Product[]> {
  const response = await fetch("/api/wholesaler/dashboard/low-stock");
  if (!response.ok) {
    throw new Error("재고 부족 상품 조회 실패");
  }
  const data = await response.json();
  return data.products ?? [];
}

export default function LowStockAlert() {
  const { data: lowStockProducts = [], isLoading } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: fetchLowStockProducts,
  });

  if (isLoading) {
    return (
      <div className="bg-[#FFF7ED] dark:bg-gray-900 rounded-3xl p-6 border border-orange-200 dark:border-orange-900/60 shadow-[0_8px_30px_rgba(249,115,22,0.1)] transition-colors duration-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-orange-400 dark:text-orange-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF7ED] dark:bg-gray-900 rounded-3xl p-6 border border-orange-200 dark:border-orange-900/60 shadow-[0_8px_30px_rgba(249,115,22,0.1)] transition-colors duration-200">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-3">
          <div className="bg-white dark:bg-gray-900 p-2.5 rounded-full shadow-sm border border-orange-100 dark:border-orange-900/60 h-fit transition-colors duration-200">
            <AlertCircle className="w-6 h-6 text-orange-500 dark:text-orange-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground dark:text-foreground">
              재고 부족 알림
            </h2>
            <p className="text-sm text-orange-600 dark:text-orange-200 font-medium mt-1">
              {lowStockProducts.length > 0
                ? `${lowStockProducts.length}개 상품 재고 부족`
                : "재고 부족 상품이 없습니다."}
            </p>
          </div>
        </div>
        {lowStockProducts.length > 0 && (
          <Link
            href="/wholesaler/products"
            aria-label="재고 부족 상품 전체 목록 보기"
            className="flex items-center gap-1 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-900/60 text-sm font-medium text-foreground dark:text-foreground hover:bg-orange-50 dark:hover:bg-orange-900/40 hover:text-orange-600 dark:hover:text-orange-200 transition-colors shadow-sm"
          >
            <span>재고 부족 상품 전체 보기</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {lowStockProducts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground text-sm bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-orange-900/60 border-dashed transition-colors duration-200">
            현재 재고가 부족한 상품이 없습니다. 👍
          </div>
        ) : (
          lowStockProducts.slice(0, 3).map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/60 shadow-sm flex items-center justify-between hover:shadow-md transition-colors duration-200"
            >
              <div>
                <h3 className="font-bold text-foreground dark:text-foreground text-lg mb-1">
                  {product.name}
                </h3>
                <p className="text-orange-600 dark:text-orange-200 font-bold">
                  재고: {product.stock_quantity}개
                </p>
              </div>
              <Link
                href={`/wholesaler/products/${product.id}/edit`}
                className="px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-900/60 text-orange-600 dark:text-orange-200 font-medium text-sm hover:bg-orange-50 dark:hover:bg-orange-900/40 transition-colors"
              >
                재고 추가
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
