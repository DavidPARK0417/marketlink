/**
 * @file components/wholesaler/Search/SearchResultsPageSkeleton.tsx
 * @description 검색 결과 페이지 로딩 스켈레톤
 *
 * 검색 결과를 로딩하는 동안 표시되는 스켈레톤 UI입니다.
 */

export function SearchResultsPageSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 헤더 스켈레톤 */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>

      {/* 검색 결과 스켈레톤 */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 space-y-3 animate-pulse"
          >
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
