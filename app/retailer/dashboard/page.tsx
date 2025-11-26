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
 * 3. 최근 주문 요약 (R.DASH.03)
 * 4. 긴급 알림/공지 (R.DASH.04)
 * 5. 월별 구매 추이 차트
 * 6. 빠른 액션 (상품 검색, 주문 내역, 장바구니 바로가기)
 * 7. 배송 예정 알림
 * 8. 실시간 시세표
 * 9. 반응형 디자인 (모바일/태블릿/데스크톱)
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 * - components/retailer/bento-grid.tsx (Bento Grid 컴포넌트)
 * - components/retailer/ai-recommendation-list.tsx (AI 추천 상품 리스트)
 * - components/retailer/recent-orders-summary.tsx (최근 주문 요약)
 * - components/retailer/urgent-alerts.tsx (긴급 알림)
 * - components/retailer/monthly-purchase-chart.tsx (월별 구매 추이 차트)
 * - components/retailer/quick-actions.tsx (빠른 액션)
 * - components/retailer/delivery-schedule-alerts.tsx (배송 예정 알림)
 * - components/retailer/market-price-table.tsx (실시간 시세표)
 *
 * @see {@link PRD.md} - R.DASH.01~04 요구사항
 */

import { BentoGrid, BentoCard } from "@/components/retailer/bento-grid";
import AIRecommendationList from "@/components/retailer/ai-recommendation-list";
import RecentOrdersSummary from "@/components/retailer/recent-orders-summary";
import UrgentAlerts from "@/components/retailer/urgent-alerts";
import MonthlyPurchaseChart from "@/components/retailer/monthly-purchase-chart";
import QuickActions from "@/components/retailer/quick-actions";
import DeliveryScheduleAlerts from "@/components/retailer/delivery-schedule-alerts";
import MarketPriceTable from "@/components/retailer/market-price-table";

// 임시 목 데이터 - AI 추천 상품 (추후 API로 교체 예정)
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
    category: "기타",
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

// 임시 목 데이터 - 최근 주문 (추후 API로 교체 예정)
const mockRecentOrders = [
  {
    id: "1",
    order_number: "20241125-0001",
    product_name: "GAP 인증 고랭지 설향 딸기 1kg 특품",
    status: "delivered" as const,
    status_label: "배송 완료",
    delivery_method: "새벽 배송",
    delivery_scheduled_time: "오전 7시 도착",
    total_price: 35800,
  },
  {
    id: "2",
    order_number: "20241124-0003",
    product_name: "노르웨이 생연어 필렛 500g",
    status: "shipping" as const,
    status_label: "배송 중",
    delivery_method: "일반 배송",
    delivery_scheduled_time: "내일 도착 예정",
    total_price: 27000,
  },
  {
    id: "3",
    order_number: "20241123-0007",
    product_name: "무농약 아스파라거스 외 1건",
    status: "preparing" as const,
    status_label: "준비 중",
    delivery_method: "새벽 배송",
    delivery_scheduled_time: "내일 오전 7시",
    total_price: 33600,
  },
];

// 임시 목 데이터 - 긴급 알림 (추후 API로 교체 예정)
const mockAlerts = [
  {
    id: "1",
    type: "stock_warning" as const,
    title: "배추 재고 부족 예상",
    message: "이번 주 배추 출하량이 줄어들 예정입니다. 미리 주문해주세요.",
    created_at: "10분 전",
  },
  {
    id: "2",
    type: "notice" as const,
    title: "새벽 배송 시간 변경 안내",
    message: "12월부터 새벽 배송 시간이 오전 6시로 변경됩니다.",
    created_at: "1시간 전",
  },
];

// 임시 목 데이터 - 월별 구매 추이 (추후 API로 교체 예정)
const mockMonthlyPurchaseData = [
  { month: "7월", amount: 1200000 },
  { month: "8월", amount: 1500000 },
  { month: "9월", amount: 1800000 },
  { month: "10월", amount: 2100000 },
  { month: "11월", amount: 2400000 },
];

// 임시 목 데이터 - 배송 예정 알림 (추후 API로 교체 예정)
const mockDeliverySchedules = [
  {
    id: "2",
    order_number: "20241124-0003",
    product_name: "노르웨이 생연어 필렛 500g",
    delivery_date: "2024-11-26",
    delivery_time: "오전 9시",
    delivery_method: "일반 배송" as const,
    status: "shipping" as const,
  },
  {
    id: "3",
    order_number: "20241123-0007",
    product_name: "무농약 아스파라거스 외 1건",
    delivery_date: "2024-11-26",
    delivery_time: "오전 7시",
    delivery_method: "새벽 배송" as const,
    status: "preparing" as const,
  },
];

// 임시 목 데이터 - 실시간 시세표 (추후 API로 교체 예정)
const mockMarketPrices = [
  {
    id: "1",
    product_name: "배추",
    current_price: 3500,
    previous_price: 3200,
    unit: "10kg",
    change_rate: 9.4,
  },
  {
    id: "2",
    product_name: "무",
    current_price: 2800,
    previous_price: 3000,
    unit: "10kg",
    change_rate: -6.7,
  },
  {
    id: "3",
    product_name: "양파",
    current_price: 4200,
    previous_price: 4200,
    unit: "10kg",
    change_rate: 0,
  },
  {
    id: "4",
    product_name: "고구마",
    current_price: 5500,
    previous_price: 5000,
    unit: "10kg",
    change_rate: 10.0,
  },
];

export default function RetailerDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 md:pb-8">
      {/* 헤더 섹션 */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
          실시간 시세와 재고, 주문 알림을 한눈에!
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          AI가 똑똑하게 알려드립니다.
        </p>
      </div>

      {/* Bento Grid 레이아웃 */}
      <BentoGrid>
        {/* 중간 카드: 최근 주문 (1x1) - R.DASH.03 */}
        <BentoCard className="min-h-[280px]">
          <RecentOrdersSummary orders={mockRecentOrders} />
        </BentoCard>

        {/* 작은 카드: 실시간 시세표 (1x1) */}
        <BentoCard className="min-h-[280px]">
          <MarketPriceTable prices={mockMarketPrices} />
        </BentoCard>

        {/* 작은 카드: 긴급 알림 (1x1) - R.DASH.04 */}
        <BentoCard className="min-h-[280px]">
          <UrgentAlerts alerts={mockAlerts} />
        </BentoCard>

        {/* 큰 카드: AI 추천 상품 (2x1) - R.DASH.02 */}
        <BentoCard colSpan={2} className="min-h-[400px] md:min-h-[500px]">
          <AIRecommendationList products={mockRecommendedProducts} />
        </BentoCard>

        {/* 작은 카드: 빠른 액션 (1x1) */}
        <BentoCard className="min-h-[280px]">
          <QuickActions />
        </BentoCard>

        {/* 배송 예정 알림과 월별 구매 추이 차트를 1칸 반씩 배치 */}
        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
          {/* 배송 예정 알림 (1칸 반 = 3/6) */}
          <div className="lg:col-span-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow min-h-[280px]">
            <DeliveryScheduleAlerts schedules={mockDeliverySchedules} />
          </div>

          {/* 월별 구매 추이 차트 (1칸 반 = 3/6) */}
          <div className="lg:col-span-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow min-h-[280px]">
            <MonthlyPurchaseChart data={mockMonthlyPurchaseData} />
          </div>
        </div>
      </BentoGrid>

      {/* 이벤트/프로모션 배너 섹션 */}
      <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* 현재 진행 중인 할인 이벤트 배너 */}
        <div className="rounded-xl bg-white dark:bg-gray-800 border-2 border-red-500 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs md:text-sm font-semibold">
              진행중
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">할인 이벤트</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            연말 특가 할인
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-4">
            전체 상품 최대 30% 할인
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-bold text-red-500">30%</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">할인</span>
          </div>
        </div>

        {/* 시즌 특가 배너 (첫 구매자/단골고객 전용) */}
        <div className="rounded-xl bg-white dark:bg-gray-800 border-2 border-blue-500 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs md:text-sm font-semibold">
              시즌 특가
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">첫 구매자/단골고객 전용</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            겨울 시즌 특가
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-4">
            첫 구매자 20% 추가 할인<br />
            단골고객 15% 추가 할인
          </p>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-blue-500">20%</span>
              <span className="text-gray-600 dark:text-gray-400 text-xs">첫 구매자</span>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-blue-500">15%</span>
              <span className="text-gray-600 dark:text-gray-400 text-xs">단골고객</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
