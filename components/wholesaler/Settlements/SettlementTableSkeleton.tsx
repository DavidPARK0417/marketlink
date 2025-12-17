/**
 * @file components/wholesaler/Settlements/SettlementTableSkeleton.tsx
 * @description 정산 테이블 로딩 스켈레톤
 *
 * 정산 목록을 로딩하는 동안 표시되는 스켈레톤 UI입니다.
 * 데스크톱에서는 테이블 형태, 모바일에서는 카드 형태로 표시됩니다.
 *
 * @dependencies
 * - components/ui/table.tsx
 */

export default function SettlementTableSkeleton() {
  return (
    <>
      {/* 데스크톱 테이블 스켈레톤 (lg 이상) */}
      <div className="hidden lg:block overflow-x-auto rounded-xl">
        <table className="w-full min-w-[800px]">
          <thead className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                주문번호
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                판매금액
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                플랫폼 수수료 (5%)
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                최종 지급액
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                정산일
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
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
            {/* 헤더 영역 */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-2" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* 카드 내용 영역 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2 text-sm transition-colors duration-200">
              <div className="flex justify-between">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="mt-3 flex justify-end">
              <div className="h-9 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
