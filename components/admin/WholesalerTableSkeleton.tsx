/**
 * @file components/admin/WholesalerTableSkeleton.tsx
 * @description 도매사업자 테이블 로딩 스켈레톤
 *
 * 도매 승인 대기 목록을 로딩하는 동안 표시되는 스켈레톤 UI입니다.
 * 데스크톱에서는 테이블 형태, 모바일에서는 카드 형태로 표시됩니다.
 */

export default function WholesalerTableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-200">
      {/* 데스크톱 테이블 스켈레톤 (lg 이상) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                상호명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                사업자번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                대표자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                신청일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 스켈레톤 (lg 미만) */}
      <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <div className="space-y-3">
              <div className="h-5 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

