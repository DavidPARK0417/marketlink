/**
 * @file components/wholesaler/Dashboard/StatCard.tsx
 * @description 대시보드 통계 카드 컴포넌트
 *
 * 대시보드에서 통계 정보를 표시하는 카드 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 제목, 값, 아이콘 표시
 * 2. 증감률 표시 (선택적)
 * 3. 로딩 상태 스켈레톤 UI
 *
 * @dependencies
 * - components/ui/card: shadcn/ui Card 컴포넌트
 * - lucide-react: 아이콘
 * - lib/utils: cn 함수
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  /** 카드 제목 */
  title: string;
  /** 표시할 값 (숫자 또는 문자열) */
  value: string | number;
  /** 아이콘 컴포넌트 (lucide-react) */
  icon: LucideIcon;
  /** 증감률 정보 (선택적) */
  trend?: {
    /** 증감률 값 (예: 12.5 = 12.5%) */
    value: number;
    /** 증가 여부 (true: 증가, false: 감소) */
    isPositive: boolean;
  };
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

// 통계 카드별 색상 설정
const getCardColorConfig = (title: string) => {
  if (title.includes("오늘 주문")) {
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "text-[#10B981] dark:text-emerald-400",
      title: "text-emerald-700 dark:text-emerald-300",
      value: "text-emerald-900 dark:text-emerald-100",
    };
  }
  if (title.includes("출고 예정")) {
    return {
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      border: "border-yellow-200 dark:border-yellow-800",
      icon: "text-yellow-600 dark:text-yellow-400",
      title: "text-yellow-700 dark:text-yellow-300",
      value: "text-yellow-900 dark:text-yellow-100",
    };
  }
  if (title.includes("정산")) {
    return {
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      title: "text-green-700 dark:text-green-300",
      value: "text-green-900 dark:text-green-100",
    };
  }
  if (title.includes("상품")) {
    return {
      bg: "bg-purple-50 dark:bg-purple-950/20",
      border: "border-purple-200 dark:border-purple-800",
      icon: "text-purple-600 dark:text-purple-400",
      title: "text-purple-700 dark:text-purple-300",
      value: "text-purple-900 dark:text-purple-100",
    };
  }
  // 기본 색상
  return {
    bg: "bg-gray-50 dark:bg-gray-900/50",
    border: "border-gray-200 dark:border-gray-800",
    icon: "text-gray-400 dark:text-gray-500",
    title: "text-gray-600 dark:text-gray-400",
    value: "text-gray-900 dark:text-gray-100",
  };
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  isLoading = false,
  className,
}: StatCardProps) {
  const colorConfig = getCardColorConfig(title);

  // 로딩 상태: 스켈레톤 UI
  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-2" />
          {trend && (
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          )}
        </CardContent>
      </Card>
    );
  }

  // 값 포맷팅 (숫자인 경우 천 단위 구분)
  const formattedValue =
    typeof value === "number"
      ? new Intl.NumberFormat("ko-KR").format(value)
      : value;

  return (
    <Card className={cn(colorConfig.bg, colorConfig.border, className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={cn("text-sm font-medium", colorConfig.title)}>
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", colorConfig.icon)} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", colorConfig.value)}>
          {formattedValue}
        </div>
        {trend && (
          <div
            className={cn(
              "mt-2 flex items-center gap-1 text-xs",
              trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {trend.isPositive ? "+" : ""}
              {Math.abs(trend.value).toFixed(1)}% 전주 대비
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

