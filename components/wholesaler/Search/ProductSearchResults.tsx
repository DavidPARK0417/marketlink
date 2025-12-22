/**
 * @file components/wholesaler/Search/ProductSearchResults.tsx
 * @description 상품 검색 결과 컴포넌트
 *
 * 상품 검색 결과를 표시하는 컴포넌트입니다.
 * 기존 ProductTable의 구조를 참고하되, 검색 결과에 맞게 간소화했습니다.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Edit2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { highlightText } from "@/lib/utils/highlight";
import { formatPrice } from "@/lib/utils/format";
import EmptyState from "@/components/common/EmptyState";
import { ProductTableSkeleton } from "@/components/wholesaler/Products/ProductTableSkeleton";
import type { Product } from "@/types/product";
import type { GetProductsResult } from "@/lib/supabase/queries/products";

interface ProductSearchResultsProps {
  products: Product[];
  isLoading?: boolean;
  query: string;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  showViewMore?: boolean;
  maxItems?: number;
}

export default function ProductSearchResults({
  products,
  isLoading = false,
  query,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showViewMore = false,
  maxItems,
}: ProductSearchResultsProps) {
  const router = useRouter();

  // 최대 개수 제한 (전체 탭에서 사용)
  const displayProducts = maxItems ? products.slice(0, maxItems) : products;

  if (isLoading) {
    return <ProductTableSkeleton />;
  }

  if (displayProducts.length === 0) {
    return (
      <EmptyState
        message="상품 검색 결과가 없습니다"
        description="다른 검색어를 시도해보세요"
        icon={Package}
      />
    );
  }

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  // 페이지 번호 배열 생성
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxPages = 5;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 5) pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        if (totalPages > 5) pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="space-y-4">
      {/* 상품 목록 */}
      <div className="space-y-3">
        {displayProducts.map((product) => (
          <Link
            key={product.id}
            href={`/wholesaler/products/${product.id}/edit`}
            className="block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition-all duration-200 hover:border-[#10B981]/30"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 이미지 */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 flex-shrink-0">
                {product.image_url ||
                (product.images && product.images.length > 0) ? (
                  <Image
                    src={product.image_url || product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>

              {/* 상품 정보 */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">
                      {highlightText(product.name, query)}
                    </h3>
                    {product.standardized_name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        표준명:{" "}
                        {highlightText(product.standardized_name, query)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${
                      product.is_active
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {product.is_active ? "활성" : "비활성"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>카테고리: {product.category}</span>
                  {product.specification && (
                    <span>규격: {product.specification}</span>
                  )}
                  <span>재고: {product.stock_quantity}개</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-[#10B981] dark:text-[#34d399]">
                    {formatPrice(product.price)}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Edit2 className="h-4 w-4 mr-2" />
                      수정
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 더보기 버튼 (전체 탭에서만 표시) */}
      {showViewMore && total > (maxItems || 0) && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("tab", "products");
              params.set("page", "1");
              router.push(`/wholesaler/search?${params.toString()}`);
            }}
          >
            상품 더보기 ({total}건)
          </Button>
        </div>
      )}

      {/* 페이지네이션 (개별 탭에서만 표시) */}
      {!showViewMore && totalPages > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 페이지 정보 및 페이지 크기 선택 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* 현재 페이지 정보 */}
            <div className="text-sm text-muted-foreground dark:text-gray-300">
              {startIndex}-{endIndex} / {total}건
            </div>

            {/* 페이지 크기 선택 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground dark:text-gray-300 whitespace-nowrap">
                페이지당:
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  onPageSizeChange(Number(value));
                  onPageChange(1);
                }}
              >
                <SelectTrigger className="w-[80px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 페이지 네비게이션 */}
          <div className="flex items-center gap-2">
            {/* 이전 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-9 px-3"
            >
              이전
            </Button>

            {/* 페이지 번호 버튼 (데스크톱/태블릿만 표시) */}
            <div className="hidden md:flex items-center gap-1">
              {pageNumbers.map((pageNum, index) => {
                if (pageNum === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-muted-foreground"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum as number)}
                    className={`h-9 px-3 ${
                      currentPage === pageNum
                        ? "bg-[#10B981] hover:bg-[#059669] text-white"
                        : ""
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            {/* 다음 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-9 px-3"
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
