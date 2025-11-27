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
 * - lib/supabase/queries/orders.ts
 * - components/ui/card.tsx
 * - components/ui/table.tsx
 * - components/ui/button.tsx
 * - components/wholesaler/Orders/OrderStatusBadge.tsx
 * - components/common/EmptyState.tsx
 */

import { getOrders } from "@/lib/supabase/queries/orders";
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
import { ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default async function RecentOrders() {
  console.log("🔍 [RecentOrders] 최근 주문 조회 시작");

  // 최근 주문 5개 조회
  const { orders } = await getOrders({
    page: 1,
    pageSize: 5,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  console.log("✅ [RecentOrders] 최근 주문 조회 완료", {
    count: orders.length,
  });

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
                {orders.map((order) => (
                  <TableRow key={order.id}>
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
