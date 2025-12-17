/**
 * @file components/wholesaler/Products/ProductFormSkeleton.tsx
 * @description 상품 등록 폼 로딩 스켈레톤
 *
 * 상품 등록 폼을 로딩하는 동안 표시되는 스켈레톤 UI입니다.
 * 폼 필드들의 스켈레톤을 표시합니다.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </CardTitle>
        <CardDescription>
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mt-2" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 상품명 */}
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="h-10 flex-1 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 이미지 업로드 */}
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-2 text-center">
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* 규격 정보 */}
          <div className="space-y-4">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>

          {/* 가격 */}
          <div className="space-y-2">
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 재고 */}
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* MOQ */}
          <div className="space-y-2">
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 배송 방법 */}
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 배송비 */}
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 상품 설명 */}
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-32 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 검색 키워드 */}
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="h-10 flex-1 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

