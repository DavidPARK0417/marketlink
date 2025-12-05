/**
 * @file components/wholesaler/Dashboard/RecentOrders.tsx
 * @description 최근 주문 컴포넌트
 *
 * 대시보드에서 최근 주문 5개를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 최근 주문 5개 조회 및 표시
 * 2. 주문번호, 주문일, 상태(뱃지), 금액 표시
 * 3. "전체 보기" 버튼 (주문 목록으로 이동)
 * 4. 빈 상태 처리 (EmptyState)
 *
 * @dependencies
 * - app/api/wholesaler/dashboard/recent-orders/route.ts
 * - components/ui/card.tsx
 * - components/ui/table.tsx
 * - components/ui/button.tsx
 * - components/wholesaler/Orders/OrderStatusBadge.tsx
 * - components/common/EmptyState.tsx
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import OrderStatusBadge from "@/components/wholesaler/Orders/OrderStatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { ShoppingCart, ChevronRight, Loader2, Truck } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { OrderDetail } from "@/types/order";

/**
 * 최근 주문 조회 함수
 */
async function fetchRecentOrders(): Promise<OrderDetail[]> {
  const response = await fetch("/api/wholesaler/dashboard/recent-orders");
  if (!response.ok) {
    throw new Error("최근 주문 조회 실패");
  }
  const data = await response.json();
  return data.orders ?? [];
}

export default function RecentOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: fetchRecentOrders,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "신규",
      confirmed: "확인완료",
      shipped: "출고완료",
      completed: "배송완료",
      cancelled: "취소됨",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: "bg-[#fbbf24] text-white",
      confirmed: "bg-[#10B981] text-white",
      shipped: "bg-[#3b82f6] text-white",
      completed: "bg-gray-400 text-white",
      cancelled: "bg-red-500 text-white",
    };
    return colorMap[status] || "bg-gray-200";
  };

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100/50">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100/50">
      <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-[#111827] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#10B981]" />
            최근 주문 배송 조회
          </h2>
          <p className="text-xs lg:text-sm text-[#6B7280] mt-1">
            {orders.length > 0
              ? `신규 주문 ${orders.filter((o) => o.status === "pending").length}건이 처리 대기 중입니다`
              : "최근 주문이 없습니다"}
          </p>
        </div>
        <Link
          href="/wholesaler/orders"
          className="text-[#10B981] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          더보기 <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-4 lg:p-6">
          <EmptyState
            message="최근 주문이 없습니다"
            description="새로운 주문이 들어오면 여기에 표시됩니다."
            icon={ShoppingCart}
          />
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F9FA]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">
                    주문번호
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">
                    상품명
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">
                    수량
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">
                    금액
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111827]">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F8F9FA] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      {order.product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      {order.quantity}박스
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                      {order.total_amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="lg:hidden divide-y divide-gray-200">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 hover:bg-[#F8F9FA] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#111827] mb-1">
                      {order.product.name}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {order.order_number}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${getStatusColor(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#6B7280]">수량: </span>
                    <span className="text-[#111827] font-medium">
                      {order.quantity}박스
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#6B7280]">금액: </span>
                    <span className="text-[#111827] font-bold">
                      {order.total_amount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
