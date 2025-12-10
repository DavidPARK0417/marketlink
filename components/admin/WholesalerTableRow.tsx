/**
 * @file components/admin/WholesalerTableRow.tsx
 * @description 도매사업자 테이블 행 컴포넌트
 *
 * 도매 승인 대기 목록 테이블의 각 행을 표시하는 클라이언트 컴포넌트입니다.
 * 행 클릭 시 상세 페이지로 이동하는 기능을 제공합니다.
 *
 * @dependencies
 * - next/navigation (useRouter)
 */

"use client";

import { useRouter } from "next/navigation";

interface WholesalerTableRowProps {
  id: string;
  business_name: string;
  business_number: string;
  representative: string;
  email: string | null;
  created_at: string;
}

export default function WholesalerTableRow({
  id,
  business_name,
  business_number,
  representative,
  email,
  created_at,
}: WholesalerTableRowProps) {
  const router = useRouter();

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleRowClick = () => {
    router.push(`/admin/wholesalers/${id}`);
  };

  return (
    <tr
      onClick={handleRowClick}
      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-foreground dark:text-foreground">
          {business_name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-muted-foreground dark:text-muted-foreground">
          {business_number}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-muted-foreground dark:text-muted-foreground">
          {representative}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-muted-foreground dark:text-muted-foreground">
          {email || "-"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-muted-foreground dark:text-muted-foreground">
          {formatDate(created_at)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-medium">
          상세보기
        </span>
      </td>
    </tr>
  );
}

