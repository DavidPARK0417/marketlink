/**
 * @file components/admin/CSStatusBadge.tsx
 * @description CS 상태 배지 컴포넌트
 *
 * CS 스레드의 상태에 따라 색상이 다른 배지를 표시합니다.
 *
 * @dependencies
 * - components/ui/badge.tsx
 * - types/database.ts
 */

import { Badge } from "@/components/ui/badge";
import type { CsThreadStatus } from "@/types/database";

interface CSStatusBadgeProps {
  status: CsThreadStatus;
}

const statusConfig: Record<
  CsThreadStatus,
  { label: string; className: string }
> = {
  open: {
    label: "대기중",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  bot_handled: {
    label: "봇 처리",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  escalated: {
    label: "에스컬레이션",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  },
  answered: {
    label: "답변완료",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  closed: {
    label: "종료",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  },
};

export default function CSStatusBadge({ status }: CSStatusBadgeProps) {
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

