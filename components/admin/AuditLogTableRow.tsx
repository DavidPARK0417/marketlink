/**
 * @file components/admin/AuditLogTableRow.tsx
 * @description 감사 로그 테이블 행 컴포넌트
 *
 * 감사 로그 테이블의 각 행을 렌더링하는 컴포넌트입니다.
 * 행 전체를 클릭하면 상세 페이지로 이동합니다.
 * HTML 표준을 준수하기 위해 useRouter를 사용하여 네비게이션합니다.
 *
 * @dependencies
 * - next/navigation (useRouter)
 * - date-fns (날짜 포맷팅)
 */

"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface AuditLogTableRowProps {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

/**
 * 액션 유형을 가독성 있게 포맷팅
 */
function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AuditLogTableRow({
  id,
  adminEmail,
  action,
  targetType,
  targetId,
  ipAddress,
  createdAt,
}: AuditLogTableRowProps) {
  const router = useRouter();
  const formattedDate = format(new Date(createdAt), "yyyy-MM-dd HH:mm:ss", {
    locale: ko,
  });

  const handleRowClick = () => {
    router.push(`/admin/audit-logs/${id}`);
  };

  return (
    <tr
      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRowClick();
        }
      }}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground">
        {adminEmail}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground">
        {formatAction(action)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground dark:text-muted-foreground">
        {targetType || "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground dark:text-muted-foreground">
        {targetId ? (
          <span className="font-mono text-xs">{targetId.slice(0, 8)}...</span>
        ) : (
          "-"
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground dark:text-muted-foreground">
        {ipAddress || "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground dark:text-muted-foreground">
        {formattedDate}
      </td>
    </tr>
  );
}

