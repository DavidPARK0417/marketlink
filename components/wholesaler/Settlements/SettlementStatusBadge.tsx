/**
 * @file components/wholesaler/Settlements/SettlementStatusBadge.tsx
 * @description 정산 상태 뱃지 컴포넌트
 *
 * 정산 상태에 따라 색상이 다른 뱃지를 표시합니다.
 *
 * @dependencies
 * - components/ui/badge.tsx
 * - types/database.ts
 */

import { Badge } from "@/components/ui/badge";
import type { SettlementStatus } from "@/types/database";

interface SettlementStatusBadgeProps {
  status: SettlementStatus;
}

const statusConfig: Record<
  SettlementStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "정산 예정",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  completed: {
    label: "정산 완료",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
};

export default function SettlementStatusBadge({
  status,
}: SettlementStatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        {status}
      </Badge>
    );
  }

  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  );
}
