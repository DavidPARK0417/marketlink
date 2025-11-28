/**
 * @file components/common/PageHeader.tsx
 * @description 페이지 헤더 컴포넌트
 *
 * 페이지 상단에 제목, 설명, 액션 버튼을 표시하는 재사용 가능한 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 페이지 제목 표시 (필수)
 * 2. 선택적 설명 텍스트
 * 3. 선택적 액션 버튼 영역 (ReactNode로 유연하게 구성)
 *
 * @dependencies
 * - @/lib/utils: cn 유틸리티
 */

import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /**
   * 페이지 제목 (필수)
   */
  title: string;
  /**
   * 페이지 설명 (선택적)
   */
  description?: string;
  /**
   * 액션 버튼 영역 (선택적, ReactNode로 받아 유연하게 구성 가능)
   */
  actions?: React.ReactNode;
  /**
   * 추가 클래스명 (선택적)
   */
  className?: string;
  /**
   * 제목 숨김 여부 (선택적, true일 경우 제목은 표시하지 않고 설명만 표시)
   */
  hideTitle?: boolean;
}

export default function PageHeader({
  title,
  description,
  actions,
  className,
  hideTitle = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 md:pb-8 border-b border-gray-200",
        className
      )}
    >
      {/* 제목 및 액션 영역 */}
      <div className="flex items-start justify-between gap-4">
        {/* 제목 및 설명 영역 */}
        <div className="flex flex-col gap-2 flex-1">
          {!hideTitle && (
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* 액션 버튼 영역 */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

