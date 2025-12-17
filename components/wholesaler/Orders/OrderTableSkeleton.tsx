/**
 * @file components/wholesaler/Orders/OrderTableSkeleton.tsx
 * @description 주문 테이블 로딩 스켈레톤
 *
 * 주문 목록을 로딩하는 동안 표시되는 스켈레톤 UI입니다.
 * 데스크톱에서는 테이블 형태, 모바일에서는 카드 형태로 표시됩니다.
 *
 * @dependencies
 * - components/ui/table.tsx
 */

export default function OrderTableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
      {/* 데스크톱 테이블 스켈레톤 (lg 이상) */}
      <div className="hidden lg:block overflow-x-auto max-w-full">
        <table className="w-full min-w-[960px] table-fixed">
          <thead className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-4 py-4 text-center text-sm font-semibold text-foreground dark:text-foreground w-16">
                번호
              </th>
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
                배송지
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                주문일시
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
                <td className="px-4 py-4 text-center">
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                </td>
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
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700 ml-auto" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
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
            className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 space-y-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                {/* 번호 */}
                <div className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 animate-pulse">
                  <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
                
                <div className="min-w-0 space-y-1 flex-1">
                  {/* 주문일시 */}
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  {/* 상품명 */}
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  {/* 주문번호 */}
                  <div className="h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                
                {/* 상태 */}
                <div className="h-8 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              </div>
              
              {/* 금액 정보 카드 */}
              <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg transition-colors duration-200">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              
              {/* 배송지 */}
              <div className="flex items-start gap-2 text-xs">
                <div className="h-3 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

