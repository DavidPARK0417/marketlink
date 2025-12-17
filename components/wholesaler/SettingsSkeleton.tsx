/**
 * @file components/wholesaler/SettingsSkeleton.tsx
 * @description 설정 페이지 로딩 스켈레톤
 *
 * 설정 페이지를 로딩하는 동안 표시되는 스켈레톤 UI입니다.
 * 폼 필드들의 스켈레톤을 표시합니다.
 */

export default function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 pb-12">
      {/* 계정 정보 섹션 스켈레톤 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-1" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-1" />
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>

      {/* 사업자 정보 수정 섹션 스켈레톤 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-1" />
        <div className="h-4 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-6" />
        <div className="space-y-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
          <div className="flex justify-end pt-4">
            <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* 이메일 변경 섹션 스켈레톤 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-6 pl-7" />
        <div className="space-y-4 pl-7">
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 섹션 스켈레톤 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-1" />
        <div className="h-4 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-6" />
        <div className="h-20 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* 알림 설정 섹션 스켈레톤 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-6 pl-7" />
        <div className="space-y-6 pl-7">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-4">
            <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

