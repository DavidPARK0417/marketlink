/**
 * @file app/retailer/products/page.tsx
 * @description 소매점 상품 목록 페이지
 *
 * 주요 기능:
 * 1. 상품 검색 (R.SEARCH.01)
 * 2. AI 표준화된 상품명 표시 (R.SEARCH.02)
 * 3. 배송 필터링 (R.SEARCH.03)
 * 4. 도매 정보 익명화 (R.SEARCH.04)
 * 5. 장바구니 추가 (R.SEARCH.05)
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 *
 * @see {@link PRD.md} - R.SEARCH.01~05 요구사항
 */

import Link from "next/link";
import Image from "next/image";
import { Search, Filter } from "lucide-react";

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
  {
    id: "3",
    name: "무농약 아스파라거스",
    standardized_name: "무농약 아스파라거스 1단",
    category: "채소",
    specification: "1단",
    price: 4500,
    moq: 2,
    image_url: "/asparagus.png",
    anonymous_seller_id: "Partner #F2B-03",
    seller_region: "충청남도 논산시",
    is_seasonal: true,
    delivery_dawn_available: true,
  },
  {
    id: "4",
    name: "유기농 동물복지 유정란",
    standardized_name: "유기농 동물복지 유정란 10구",
    category: "축산물",
    specification: "10구",
    price: 7800,
    moq: 1,
    image_url: "/eggs.jpg",
    anonymous_seller_id: "Partner #F2B-04",
    seller_region: "경기도 안산시",
    is_seasonal: false,
    delivery_dawn_available: true,
  },
];

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 헤더 섹션 */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          상품 목록
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          AI가 표준화한 상품명으로 투명한 가격 비교
        </p>
      </div>

      {/* 검색 및 필터 영역 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* 검색창 */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="상품명, 카테고리 검색 (Cmd+K)"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* 필터 버튼 */}
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">필터</span>
        </button>
      </div>

      {/* 필터 칩 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium whitespace-nowrap">
          전체
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          새벽 배송 가능
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          제철 농산물
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          과일
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          채소
        </button>
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <Link
            key={product.id}
            href={`/retailer/products/${product.id}`}
            className="group flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
          >
            {/* 이미지 영역 */}
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
              {/* 판매자 정보 */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {product.anonymous_seller_id} · {product.seller_region}
              </p>

              {/* 상품명 */}
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                {product.standardized_name}
              </h3>

              {/* 규격 */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {product.specification}
              </p>

              {/* 가격 */}
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

      {/* 더보기 버튼 */}
      <div className="flex justify-center mt-8">
        <button className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
          더 보기
        </button>
      </div>
    </div>
  );
}

