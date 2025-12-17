/**
 * @file components/wholesaler/Dashboard/RecentOrdersSkeleton.tsx
 * @description 최근 주문 컴포넌트 로딩 스켈레톤
 *
 * 최근 주문 컴포넌트가 로딩 중일 때 표시되는 스켈레톤 UI입니다.
 * 데스크톱에서는 테이블 형태, 모바일에서는 카드 형태로 표시됩니다.
 *
 * @dependencies
 * - components/ui/card.tsx
 * - components/ui/table.tsx
 */

export default function RecentOrdersSkeleton() {
  return (
    <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100/50 dark:border-gray-800 transition-colors duration-200">
      {/* 헤더 스켈레톤 */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex-1">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-2" />
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* 데스크톱 테이블 스켈레톤 (xl 이상) */}
      <div className="hidden xl:block overflow-x-hidden">
        <table className="w-full">
          <thead className="bg-[#F8F9FA] dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                주문번호
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                상품명
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                수량
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                금액
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
                className="hover:bg-[#F8F9FA] dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
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

      {/* 모바일/중간 화면 카드 스켈레톤 (xl 미만) */}
      <div className="xl:hidden divide-y divide-gray-200 dark:divide-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 hover:bg-[#F8F9FA] dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-2" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 ml-2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="col-span-2">
                <div className="h-3 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
