/**
 * @file components/wholesaler/Search/OrderSearchResults.tsx
 * @description 주문 검색 결과 컴포넌트
 *
 * 주문 검색 결과를 표시하는 컴포넌트입니다.
 * 기존 OrderTable의 구조를 참고하되, 검색 결과에 맞게 간소화했습니다.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { highlightText } from "@/lib/utils/highlight";
import EmptyState from "@/components/common/EmptyState";
import OrderTableSkeleton from "@/components/wholesaler/Orders/OrderTableSkeleton";
import type { OrderDetail } from "@/types/order";
import type { GetOrdersResult } from "@/lib/supabase/queries/orders";

interface OrderSearchResultsProps {
  orders: OrderDetail[];
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

export default function OrderSearchResults({
  orders,
  isLoading = false,
  query,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showViewMore = false,
  maxItems,
}: OrderSearchResultsProps) {
  const router = useRouter();

  // 최대 개수 제한 (전체 탭에서 사용)
  const displayOrders = maxItems ? orders.slice(0, maxItems) : orders;

  if (isLoading) {
    return <OrderTableSkeleton />;
  }

  if (displayOrders.length === 0) {
    return (
      <EmptyState
        message="주문 검색 결과가 없습니다"
        description="다른 검색어를 시도해보세요"
        icon={ShoppingCart}
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
      {/* 주문 목록 */}
      <div className="space-y-3">
        {displayOrders.map((order) => {
          // retailers 정보는 조인된 데이터에서 가져옴
          const retailer = (order as any).retailers;
          const customerName = retailer?.business_name || retailer?.anonymous_code || "고객";
          
          return (
            <Link
              key={order.id}
              href={`/wholesaler/orders/${order.id}`}
              className="block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition-all duration-200 hover:border-[#10B981]/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">
                      {highlightText(order.order_number, query)}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : order.status === "confirmed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : order.status === "completed"
                          ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {order.status === "pending"
                        ? "신규"
                        : order.status === "confirmed"
                        ? "확인완료"
                        : order.status === "shipped"
                        ? "출고완료"
                        : order.status === "completed"
                        ? "배송완료"
                        : "취소"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{highlightText(order.product?.name || "-", query)}</span>
                    {order.variant && (
                      <span className="ml-2">({order.variant.name})</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>고객: {highlightText(customerName, query)}</span>
                    <span>수량: {order.quantity}박스</span>
                    <span>
                      {format(new Date(order.created_at), "yyyy-MM-dd HH:mm", {
                        locale: ko,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#10B981] dark:text-[#34d399]">
                      {new Intl.NumberFormat("ko-KR").format(order.total_amount)}원
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Eye className="h-4 w-4 mr-2" />
                      상세보기
                    </span>
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 더보기 버튼 (전체 탭에서만 표시) */}
      {showViewMore && total > (maxItems || 0) && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("tab", "orders");
              params.set("page", "1");
              router.push(`/wholesaler/search?${params.toString()}`);
            }}
          >
            주문 더보기 ({total}건)
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
