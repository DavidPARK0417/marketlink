/**
 * @file components/wholesaler/Inquiries/InquiryStatusBadge.tsx
 * @description 문의 상태 뱃지 컴포넌트
 *
 * 문의 상태에 따라 색상이 다른 뱃지를 표시합니다.
 *
 * @dependencies
 * - components/ui/badge.tsx
 * - types/database.ts
 */

import { Badge } from "@/components/ui/badge";
import type { InquiryStatus } from "@/types/database";

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
}

const statusConfig: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  open: {
    label: "미답변",
    className: "bg-red-100 text-red-800 hover:bg-red-200",
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

export default function InquiryStatusBadge({
  status,
}: InquiryStatusBadgeProps) {
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
