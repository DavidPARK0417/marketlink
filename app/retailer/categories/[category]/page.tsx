/**
 * @file app/retailer/categories/[category]/page.tsx
 * @description 소매점 카테고리별 상품 목록 페이지
 *
 * 주요 기능:
 * 1. 카테고리별 상품 표시
 * 2. 필터링 (지역, 가격대, 배송 옵션)
 * 3. 도매 정보 익명화
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 *
 * @see {@link PRD.md} - R.SEARCH.01~04 요구사항
 */

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Filter, SlidersHorizontal } from "lucide-react";

// 카테고리 목록
const categories = {
  fruits: { name: "과일", icon: "🍎" },
  vegetables: { name: "채소", icon: "🥬" },
  seafood: { name: "수산물", icon: "🐟" },
  meat: { name: "축산물", icon: "🥩" },
};

// 임시 목 데이터
const mockProducts = [
  {
    id: "1",
    name: "고당도 설향 딸기",
    standardized_name: "GAP 인증 고랭지 설향 딸기 1kg 특품",
    category: "과일",
    specification: "1kg",
    price: 15900,
    moq: 1,
    image_url: "/strawberry.jpg",
    anonymous_seller_id: "Partner #F2B-01",
    seller_region: "경기도 양평군",
    is_seasonal: true,
    delivery_dawn_available: true,
  },
  {
    id: "2",
    name: "노르웨이 생연어 필렛",
    standardized_name: "노르웨이 생연어 필렛 500g",
    category: "수산물",
    specification: "500g",
    price: 22000,
    moq: 1,
    image_url: "/salmon.jpg",
    anonymous_seller_id: "Partner #F2B-02",
    seller_region: "부산시 해운대구",
    is_seasonal: false,
    delivery_dawn_available: false,
  },
];

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryInfo =
    categories[category as keyof typeof categories] || categories.fruits;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 뒤로가기 */}
      <Link
        href="/retailer/products"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>전체 상품</span>
      </Link>

      {/* 헤더 */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{categoryInfo.icon}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {categoryInfo.name}
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          신선한 {categoryInfo.name} 상품을 만나보세요
        </p>
      </div>

      <div className="flex gap-8">
        {/* 왼쪽: 필터 사이드바 (데스크톱만) */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              필터
            </h2>

            {/* 생산지/지역 */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                생산지 / 지역
              </h3>
              <div className="space-y-2">
                {["서울/경기/인천", "강원도", "충청도", "전라도", "경상도", "제주도"].map(
                  (region) => (
                    <label
                      key={region}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {region}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* 가격대 */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                가격대
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    1만원 이하
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    1만원 ~ 3만원
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    3만원 이상
                  </span>
                </label>
              </div>
            </div>

            {/* 배송 옵션 */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                배송 옵션
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    새벽 배송 가능
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    제철 농산물
                  </span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* 오른쪽: 상품 목록 */}
        <div className="flex-1">
          {/* 정렬 및 모바일 필터 */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              총 {mockProducts.length}개 상품
            </p>

            <div className="flex items-center gap-3">
              {/* 모바일 필터 버튼 */}
              <button className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium">
                <SlidersHorizontal className="w-4 h-4" />
                필터
              </button>

              {/* 정렬 */}
              <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm">
                <option>추천순</option>
                <option>낮은 가격순</option>
                <option>높은 가격순</option>
                <option>최신순</option>
              </select>
            </div>
          </div>

          {/* 상품 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map((product) => (
              <Link
                key={product.id}
                href={`/retailer/products/${product.id}`}
                className="group flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                {/* 이미지 */}
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image
                    src={product.image_url}
                    alt={product.standardized_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* 배지 */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {product.is_seasonal && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        제철
                      </span>
                    )}
                    {product.delivery_dawn_available && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                        새벽배송
                      </span>
                    )}
                  </div>
                </div>

                {/* 상품 정보 */}
                <div className="flex flex-col p-4 gap-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.anonymous_seller_id} · {product.seller_region}
                  </p>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                    {product.standardized_name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.specification}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {product.price.toLocaleString()}원
                    </p>
                    {product.moq > 1 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        최소 {product.moq}개
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

