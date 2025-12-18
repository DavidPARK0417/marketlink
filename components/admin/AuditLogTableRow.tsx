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
    <>
      {/* 모바일 카드 뷰 */}
      <tr className="md:hidden">
        <td colSpan={6} className="px-4 py-4">
          <div
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground dark:text-foreground truncate">
                  {adminEmail}
                </p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                  {formatAction(action)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground whitespace-nowrap">
                {formattedDate.split(' ')[0]}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground dark:text-muted-foreground">
              {targetType && (
                <span>타입: {targetType}</span>
              )}
              {targetId && (
                <span className="font-mono">ID: {targetId.slice(0, 8)}...</span>
              )}
              {ipAddress && (
                <span>IP: {ipAddress}</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground dark:text-muted-foreground">
              {formattedDate}
            </div>
          </div>
        </td>
      </tr>

      {/* 데스크톱/태블릿 테이블 뷰 */}
      <tr
        className="hidden md:table-row hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
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
        <td className="px-3 md:px-4 lg:px-6 py-4 text-sm text-foreground dark:text-foreground">
          <div className="max-w-[120px] md:max-w-[150px] lg:max-w-[200px] truncate">{adminEmail}</div>
        </td>
        <td className="px-3 md:px-4 lg:px-6 py-4 text-sm text-foreground dark:text-foreground">
          <div className="max-w-[100px] md:max-w-[120px] truncate">{formatAction(action)}</div>
        </td>
        <td className="px-3 md:px-4 lg:px-6 py-4 text-sm text-muted-foreground dark:text-muted-foreground hidden lg:table-cell">
          <div className="max-w-[100px] truncate">{targetType || "-"}</div>
        </td>
        <td className="px-3 md:px-4 lg:px-6 py-4 text-sm text-muted-foreground dark:text-muted-foreground hidden xl:table-cell">
          {targetId ? (
            <span className="font-mono text-xs">{targetId.slice(0, 8)}...</span>
          ) : (
            "-"
          )}
        </td>
        <td className="px-3 md:px-4 lg:px-6 py-4 text-sm text-muted-foreground dark:text-muted-foreground hidden xl:table-cell">
          <div className="max-w-[120px] truncate">{ipAddress || "-"}</div>
        </td>
        <td className="px-3 md:px-4 lg:px-6 py-4 text-sm text-muted-foreground dark:text-muted-foreground">
          <div className="whitespace-nowrap">{formattedDate}</div>
        </td>
      </tr>
    </>
  );
}

