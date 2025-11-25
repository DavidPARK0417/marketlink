/**
 * @file components/retailer/ai-recommendation-list.tsx
 * @description AI 추천 상품 리스트 컴포넌트
 *
 * "지금 구매해야 할 상품" 리스트를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. AI 추천 상품 리스트 표시
 * 2. 스크롤 가능한 가로 리스트 (모바일) 또는 그리드 (데스크톱)
 * 3. 빈 상태 처리
 *
 * @dependencies
 * - components/retailer/ai-recommendation-card.tsx
 *
 * @see {@link PRD.md} - R.DASH.02 요구사항
 */

"use client";

import AIRecommendationCard from "./ai-recommendation-card";

interface AIRecommendationProduct {
  id: string;
  name: string;
  standardized_name?: string;
  category: string;
  specification?: string;
  price: number;
  moq?: number;
  image_url: string;
  is_seasonal?: boolean;
  stock_warning?: boolean;
  anonymous_seller_id?: string;
  seller_region?: string;
}

interface AIRecommendationListProps {
  products: AIRecommendationProduct[];
}

export default function AIRecommendationList({
  products,
}: AIRecommendationListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          추천 상품이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 제목 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          지금 구매해야 할 상품
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {products.length}개
        </span>
      </div>

      {/* 상품 리스트 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto flex-1">
        {products.map((product) => (
          <AIRecommendationCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

