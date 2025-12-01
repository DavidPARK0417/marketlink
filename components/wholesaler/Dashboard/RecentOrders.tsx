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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "@/components/wholesaler/Orders/OrderStatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">최근 주문</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">최근 주문</CardTitle>
        <Link href="/wholesaler/orders">
          <Button variant="outline" size="sm">
            전체 보기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <EmptyState
            message="최근 주문이 없습니다"
            description="새로운 주문이 들어오면 여기에 표시됩니다."
            icon={ShoppingCart}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문번호</TableHead>
                  <TableHead>주문일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  // 주문 상태별 배경색 설정
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case "completed":
                        return "bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-950/20 dark:hover:bg-green-900/30 dark:border-green-800";
                      case "shipped":
                        return "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 dark:border-blue-800";
                      case "confirmed":
                        return "bg-cyan-50 hover:bg-cyan-100 border-cyan-200 dark:bg-cyan-950/20 dark:hover:bg-cyan-900/30 dark:border-cyan-800";
                      case "pending":
                        return "bg-yellow-50 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-950/20 dark:hover:bg-yellow-900/30 dark:border-yellow-800";
                      case "cancelled":
                        return "bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:border-red-800";
                      default:
                        return "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700";
                    }
                  };

                  return (
                    <TableRow
                      key={order.id}
                      className={getStatusColor(order.status)}
                    >
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), "yyyy-MM-dd HH:mm", {
                          locale: ko,
                        })}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat("ko-KR").format(
                          order.total_amount,
                        )}
                        원
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
