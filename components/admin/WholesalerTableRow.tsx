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
  rowNumber?: number;
}

export default function WholesalerTableRow({
  id,
  business_name,
  business_number,
  representative,
  email,
  created_at,
  rowNumber,
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
      <td className="px-2 lg:px-3 py-3 lg:py-4 whitespace-nowrap w-20 min-w-[60px] text-center">
        <div className="text-xs lg:text-sm text-muted-foreground dark:text-gray-300">
          {rowNumber}
        </div>
      </td>
      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
        <div className="text-xs lg:text-sm font-medium text-foreground dark:text-white">
          {business_name}
        </div>
      </td>
      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
        <div className="text-xs lg:text-sm text-muted-foreground dark:text-gray-300">
          {business_number}
        </div>
      </td>
      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
        <div className="text-xs lg:text-sm text-muted-foreground dark:text-gray-300">
          {representative}
        </div>
      </td>
      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
        <div className="text-xs lg:text-sm text-muted-foreground dark:text-gray-300 break-all">
          {email || "-"}
        </div>
      </td>
      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
        <div className="text-xs lg:text-sm text-muted-foreground dark:text-gray-300">
          {formatDate(created_at)}
        </div>
      </td>
      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm">
        <span className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-medium">
          상세보기
        </span>
      </td>
    </tr>
  );
}

