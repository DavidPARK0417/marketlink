/**
 * @file components/wholesaler/Inquiries/InquiryListSkeleton.tsx
 * @description 문의 목록 로딩 스켈레톤
 *
 * 문의 목록을 로딩하는 동안 표시되는 스켈레톤 UI입니다.
 * 데스크톱에서는 테이블 형태, 모바일에서는 카드 형태로 표시됩니다.
 *
 * @dependencies
 * - types/inquiry.ts
 */

export default function InquiryListSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
      {/* 데스크톱 테이블 스켈레톤 (lg 이상) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-200 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-16 text-center">
                번호
              </th>
              <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-40">
                고객 코드
              </th>
              <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">
                문의 제목 / 내용
              </th>
              <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-28 text-center">
                상태
              </th>
              <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 w-40 text-center">
                생성일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <td className="p-4 text-center">
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 스켈레톤 (lg 미만) */}
      <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-2" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 ml-2" />
            </div>
            <div className="h-5 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-2" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

