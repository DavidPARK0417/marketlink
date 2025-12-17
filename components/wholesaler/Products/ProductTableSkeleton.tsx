/**
 * @file components/wholesaler/Products/ProductTableSkeleton.tsx
 * @description 상품 테이블 로딩 스켈레톤
 *
 * 상품 목록을 로딩하는 동안 표시되는 스켈레톤 UI입니다.
 * 데스크톱에서는 테이블 형태, 모바일에서는 카드 형태로 표시됩니다.
 */

export function ProductTableSkeleton() {
  return (
    <div className="space-y-3">
      {/* 모바일~노트북 카드 스켈레톤 (xl 미만) */}
      <div className="xl:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 space-y-3 transition-colors duration-200"
          >
            <div className="flex items-start gap-3">
              {/* 이미지 스켈레톤 */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 flex-shrink-0 animate-pulse" />
              
              <div className="flex-1 space-y-1">
                {/* 상품명 및 상태 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
                {/* 스펙 */}
                <div className="h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                {/* 카테고리 및 가격 */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="ml-auto h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                {/* 재고 및 MOQ */}
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
            {/* 액션 버튼 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 스켈레톤 (xl 이상) */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hidden xl:block transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
                <th className="px-6 py-4 text-xs font-bold text-foreground dark:text-foreground uppercase tracking-wider text-center">
                  이미지
                </th>
                <th className="px-6 py-4 text-xs font-bold text-foreground dark:text-foreground uppercase tracking-wider text-center">
                  상품명
                </th>
                <th className="px-6 py-4 text-xs font-bold text-foreground dark:text-foreground uppercase tracking-wider text-center">
                  카테고리
                </th>
                <th className="px-6 py-4 text-xs font-bold text-foreground dark:text-foreground uppercase tracking-wider text-center">
                  가격
                </th>
                <th className="px-6 py-4 text-xs font-bold text-foreground dark:text-foreground uppercase tracking-wider text-center">
                  재고
                </th>
                <th className="px-6 py-4 text-xs font-bold text-foreground dark:text-foreground uppercase tracking-wider text-center">
                  상태
                </th>
                <th className="px-6 py-4 text-xs font-bold text-foreground dark:text-foreground uppercase tracking-wider text-center">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors duration-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="hover:bg-gradient-to-r hover:from-[#10B981]/5 hover:to-transparent dark:hover:from-[#10B981]/10 dark:hover:to-gray-900 transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

