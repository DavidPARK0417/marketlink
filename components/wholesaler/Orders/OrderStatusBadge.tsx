/**
 * @file components/wholesaler/Orders/OrderStatusBadge.tsx
 * @description 주문 상태 뱃지 컴포넌트
 *
 * 주문 상태에 따라 색상이 다른 뱃지를 표시합니다.
 *
 * @dependencies
 * - components/ui/badge.tsx
 * - types/database.ts
 */

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/database";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "신규 주문",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  confirmed: {
    label: "접수 확인",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  },
  shipped: {
    label: "출고 완료",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  completed: {
    label: "배송 완료",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  },
  cancelled: {
    label: "취소",
    className: "bg-red-100 text-red-800 hover:bg-red-200",
  },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  );
}

