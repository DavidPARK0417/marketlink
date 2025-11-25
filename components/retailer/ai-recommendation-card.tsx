/**
 * @file components/retailer/ai-recommendation-card.tsx
 * @description AI 추천 상품 카드 컴포넌트
 *
 * AI가 추천한 상품을 표시하는 카드 컴포넌트입니다.
 * 제철 농산물 배지, 재고 부족 알림 등을 포함합니다.
 *
 * 주요 기능:
 * 1. 상품 이미지 및 정보 표시
 * 2. 제철 농산물 배지 표시
 * 3. 재고 부족 예상 알림 UI
 * 4. 익명 판매자 정보 표시 (Partner #XXX)
 *
 * @dependencies
 * - next/image (Image)
 * - components/ui/badge (Badge)
 * - lucide-react (아이콘)
 *
 * @see {@link PRD.md} - R.DASH.02 요구사항
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Sparkles } from "lucide-react";

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

interface AIRecommendationCardProps {
  product: AIRecommendationProduct;
}

export default function AIRecommendationCard({
  product,
}: AIRecommendationCardProps) {
  const displayName = product.standardized_name || product.name;
  const imageUrl = product.image_url || "/placeholder-product.png";

  return (
    <Link
      href={`/retailer/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={displayName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* 배지 오버레이 */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.is_seasonal && (
            <Badge
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white border-0"
            >
              <Sparkles className="w-3 h-3" />
              제철
            </Badge>
          )}
          {product.stock_warning && (
            <Badge
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <AlertTriangle className="w-3 h-3" />
              재고 부족 예상
            </Badge>
          )}
        </div>
      </div>

      {/* 상품 정보 영역 */}
      <div className="flex flex-1 flex-col justify-between p-4 gap-3">
        <div className="flex flex-col gap-1">
          {/* 판매자 정보 */}
          {product.anonymous_seller_id && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {product.anonymous_seller_id}
              {product.seller_region && ` · ${product.seller_region}`}
            </p>
          )}

          {/* 상품명 */}
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
            {displayName}
          </h3>

          {/* 규격 정보 */}
          {product.specification && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {product.specification}
            </p>
          )}
        </div>

        {/* 가격 */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {product.price.toLocaleString()}원
          </p>
          {product.moq && product.moq > 1 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              최소 {product.moq}개
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

