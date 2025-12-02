/**
 * @file components/admin/RoleBadge.tsx
 * @description 역할 배지 컴포넌트
 *
 * 사용자의 역할(wholesaler, retailer)에 따라 색상이 다른 배지를 표시합니다.
 *
 * @dependencies
 * - components/ui/badge.tsx
 */

import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: "wholesaler" | "retailer" | "admin" | null;
}

const roleConfig: Record<
  "wholesaler" | "retailer" | "admin",
  { label: string; className: string }
> = {
  wholesaler: {
    label: "도매",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  },
  retailer: {
    label: "소매",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  admin: {
    label: "관리자",
    className: "bg-red-100 text-red-800 hover:bg-red-200",
  },
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  if (!role || !(role in roleConfig)) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        미지정
      </Badge>
    );
  }

  const config = roleConfig[role];

  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  );
}

