/**
 * @file app/retailer/dashboard/page.tsx
 * @description 소매점 대시보드 페이지
 *
 * 소매점 사용자의 메인 대시보드입니다.
 * Bento Grid 레이아웃을 사용하여 AI 추천 상품, 최근 주문 요약, 긴급 알림 등을 표시합니다.
 *
 * 주요 기능:
 * 1. Bento Grid 레이아웃 (R.DASH.01)
 * 2. AI 추천 상품 모듈 (R.DASH.02)
 * 3. 반응형 디자인 (모바일/태블릿/데스크톱)
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 * - components/retailer/bento-grid.tsx (Bento Grid 컴포넌트)
 * - components/retailer/ai-recommendation-list.tsx (AI 추천 상품 리스트)
 *
 * @see {@link PRD.md} - R.DASH.01, R.DASH.02 요구사항
 */

import { BentoGrid, BentoCard } from "@/components/retailer/bento-grid";
import AIRecommendationList from "@/components/retailer/ai-recommendation-list";

// 임시 목 데이터 (추후 API로 교체 예정)
const mockRecommendedProducts = [
  {
    id: "1",
    name: "고당도 설향 딸기",
    standardized_name: "GAP 인증 고랭지 설향 딸기 1kg 특품",
    category: "과일",
    specification: "1kg",
    price: 15900,
    moq: 1,
    image_url: "/strawberry.jpg",
    is_seasonal: true,
    stock_warning: false,
    anonymous_seller_id: "Partner #F2B-01",
    seller_region: "경기도 양평군",
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
    is_seasonal: false,
    stock_warning: true,
    anonymous_seller_id: "Partner #F2B-02",
    seller_region: "부산시 해운대구",
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
    is_seasonal: true,
    stock_warning: false,
    anonymous_seller_id: "Partner #F2B-03",
    seller_region: "충청남도 논산시",
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
    is_seasonal: false,
    stock_warning: true,
    anonymous_seller_id: "Partner #F2B-04",
    seller_region: "경기도 안산시",
  },
];

export default function RetailerDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 헤더 섹션 */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          대시보드
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          재고 관리 및 구매 타이밍 최적화를 위한 AI 기반 대시보드
        </p>
      </div>

      {/* Bento Grid 레이아웃 */}
      <BentoGrid>
        {/* 큰 카드: AI 추천 상품 (2x1) */}
        <BentoCard colSpan={2} className="min-h-[400px] md:min-h-[500px]">
          <AIRecommendationList products={mockRecommendedProducts} />
        </BentoCard>

        {/* 작은 카드: 긴급 알림 (1x1) */}
        <BentoCard>
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              긴급 알림
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              곧 추가될 예정입니다.
            </p>
          </div>
        </BentoCard>

        {/* 중간 카드: 최근 주문 (1x1) */}
        <BentoCard>
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              최근 주문
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              곧 추가될 예정입니다.
            </p>
          </div>
        </BentoCard>

        {/* 큰 카드: 통계/차트 (2x1) */}
        <BentoCard colSpan={2} className="min-h-[200px] md:min-h-[240px]">
          <div className="h-full flex flex-col">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              구매 통계
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              곧 추가될 예정입니다.
            </p>
          </div>
        </BentoCard>

        {/* 작은 카드: 빠른 액션 (1x1) */}
        <BentoCard>
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              빠른 액션
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              곧 추가될 예정입니다.
            </p>
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

