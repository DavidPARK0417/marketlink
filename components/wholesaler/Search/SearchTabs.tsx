/**
 * @file components/wholesaler/Search/SearchTabs.tsx
 * @description 검색 결과 탭 컴포넌트
 *
 * 전체, 주문, 상품 탭을 표시하는 컴포넌트입니다.
 * 디자인 핸드오프 스타일의 Pill Button을 사용합니다.
 */

"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface SearchTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  ordersCount: number;
  productsCount: number;
  totalCount: number;
}

export default function SearchTabs({
  value,
  onValueChange,
  ordersCount,
  productsCount,
  totalCount,
}: SearchTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-full">
      <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto">
        <TabsTrigger
          value="all"
          className={cn(
            "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
            "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#10B981] data-[state=active]:to-[#059669]",
            "data-[state=active]:text-white data-[state=active]:shadow-[0_4px_20px_rgba(16,185,129,0.3)]",
            "data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700",
            "data-[state=inactive]:border data-[state=inactive]:border-gray-300",
            "data-[state=inactive]:hover:bg-gray-50",
            "dark:data-[state=inactive]:bg-gray-900 dark:data-[state=inactive]:text-gray-300",
            "dark:data-[state=inactive]:border-gray-700 dark:data-[state=inactive]:hover:bg-gray-800",
          )}
        >
          전체 ({totalCount})
        </TabsTrigger>
        <TabsTrigger
          value="orders"
          className={cn(
            "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
            "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#10B981] data-[state=active]:to-[#059669]",
            "data-[state=active]:text-white data-[state=active]:shadow-[0_4px_20px_rgba(16,185,129,0.3)]",
            "data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700",
            "data-[state=inactive]:border data-[state=inactive]:border-gray-300",
            "data-[state=inactive]:hover:bg-gray-50",
            "dark:data-[state=inactive]:bg-gray-900 dark:data-[state=inactive]:text-gray-300",
            "dark:data-[state=inactive]:border-gray-700 dark:data-[state=inactive]:hover:bg-gray-800",
          )}
        >
          주문 ({ordersCount})
        </TabsTrigger>
        <TabsTrigger
          value="products"
          className={cn(
            "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
            "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#10B981] data-[state=active]:to-[#059669]",
            "data-[state=active]:text-white data-[state=active]:shadow-[0_4px_20px_rgba(16,185,129,0.3)]",
            "data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700",
            "data-[state=inactive]:border data-[state=inactive]:border-gray-300",
            "data-[state=inactive]:hover:bg-gray-50",
            "dark:data-[state=inactive]:bg-gray-900 dark:data-[state=inactive]:text-gray-300",
            "dark:data-[state=inactive]:border-gray-700 dark:data-[state=inactive]:hover:bg-gray-800",
          )}
        >
          상품 ({productsCount})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
