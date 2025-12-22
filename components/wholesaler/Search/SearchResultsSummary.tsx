/**
 * @file components/wholesaler/Search/SearchResultsSummary.tsx
 * @description 검색 결과 요약 컴포넌트
 *
 * 검색어와 검색 결과 개수를 표시하는 컴포넌트입니다.
 */

import { highlightText } from "@/lib/utils/highlight";

interface SearchResultsSummaryProps {
  query: string;
  totalCount: number;
  ordersCount: number;
  productsCount: number;
  activeTab: string;
}

export default function SearchResultsSummary({
  query,
  totalCount,
  ordersCount,
  productsCount,
  activeTab,
}: SearchResultsSummaryProps) {
  if (!query || query.length < 2) {
    return null;
  }

  const getSummaryText = () => {
    if (activeTab === "orders") {
      return `주문 ${ordersCount}건`;
    } else if (activeTab === "products") {
      return `상품 ${productsCount}건`;
    } else {
      return `총 ${totalCount}건 (주문 ${ordersCount}건, 상품 ${productsCount}건)`;
    }
  };

  return (
    <div className="space-y-2">
      <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
        검색 결과
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm lg:text-base text-muted-foreground">
        <span>
          검색어: <span className="font-semibold text-foreground">{highlightText(query, query)}</span>
        </span>
        <span className="hidden sm:inline">•</span>
        <span>{getSummaryText()}</span>
      </div>
    </div>
  );
}
