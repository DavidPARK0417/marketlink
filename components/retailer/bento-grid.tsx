/**
 * @file components/retailer/bento-grid.tsx
 * @description Bento Grid 레이아웃 컴포넌트
 *
 * 모듈형 Bento Grid 레이아웃을 제공합니다.
 * 다양한 크기의 카드들이 그리드 형태로 배치됩니다.
 *
 * 주요 기능:
 * 1. 반응형 그리드 레이아웃 (모바일/태블릿/데스크톱)
 * 2. 다양한 크기의 카드 지원 (1x1, 2x1, 1x2, 2x2)
 * 3. Tailwind CSS로 스타일링
 *
 * @dependencies
 * - Tailwind CSS
 *
 * @see {@link PRD.md} - R.DASH.01 요구사항
 */

import { ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
}

/**
 * Bento Grid 컨테이너 컴포넌트
 *
 * 반응형 그리드 레이아웃을 제공합니다.
 * - 모바일: 1열 (grid-cols-1)
 * - 태블릿: 2열 (md:grid-cols-2)
 * - 데스크톱: 3열 (lg:grid-cols-3)
 */
export function BentoGrid({ children }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {children}
    </div>
  );
}

/**
 * Bento Card 컴포넌트
 *
 * Bento Grid 내부의 개별 카드입니다.
 * 다양한 크기를 지원합니다.
 *
 * @param colSpan - 가로로 차지할 열 수 (1 또는 2)
 * @param rowSpan - 세로로 차지할 행 수 (1 또는 2)
 */
export function BentoCard({
  children,
  className = "",
  colSpan = 1,
  rowSpan = 1,
}: BentoCardProps) {
  const colSpanClasses = {
    1: "col-span-1",
    2: "md:col-span-2",
  };

  const rowSpanClasses = {
    1: "row-span-1",
    2: "md:row-span-2",
  };

  return (
    <div
      className={`
        ${colSpanClasses[colSpan]}
        ${rowSpanClasses[rowSpan]}
        rounded-xl
        bg-white
        dark:bg-gray-800
        border
        border-gray-200
        dark:border-gray-700
        p-4
        md:p-6
        shadow-sm
        hover:shadow-md
        transition-shadow
        ${className}
      `}
    >
      {children}
    </div>
  );
}

