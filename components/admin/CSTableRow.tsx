/**
 * @file components/admin/CSTableRow.tsx
 * @description CS 테이블 행 컴포넌트
 *
 * CS 목록 테이블의 각 행을 표시하는 클라이언트 컴포넌트입니다.
 * 행 클릭 시 상세 페이지로 이동하는 기능을 제공합니다.
 *
 * @dependencies
 * - next/navigation (useRouter)
 * - components/admin/CSStatusBadge.tsx
 * - components/admin/RoleBadge.tsx
 */

"use client";

import { useRouter } from "next/navigation";
import CSStatusBadge from "@/components/admin/CSStatusBadge";
import RoleBadge from "@/components/admin/RoleBadge";
import type { CsThreadStatus } from "@/types/database";

interface CSTableRowProps {
  id: string;
  title: string;
  email: string;
  role: "wholesaler" | "retailer" | "admin" | null;
  status: CsThreadStatus;
  created_at: string;
}

export default function CSTableRow({
  id,
  title,
  email,
  role,
  status,
  created_at,
}: CSTableRowProps) {
  const router = useRouter();

  // 날짜 포맷팅 함수 (2025-01-15 14:30 형식)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleRowClick = () => {
    router.push(`/admin/cs/${id}`);
  };

  return (
    <tr
      onClick={handleRowClick}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{title}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-900">{email}</div>
          <RoleBadge role={role} />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <CSStatusBadge status={status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{formatDate(created_at)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className="text-[#10B981] hover:text-emerald-900 font-medium">
          상세보기
        </span>
      </td>
    </tr>
  );
}

