/**
 * @file app/retailer/orders/page.tsx
 * @description 소매점 주문 내역 페이지
 *
 * 주요 기능:
 * 1. 주문 상태 조회 (R.MY.01)
 * 2. 배송 타임라인 (R.MY.02)
 * 3. 구매 확정 (R.MY.03)
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 *
 * @see {@link PRD.md} - R.MY.01~03 요구사항
 */

import Link from "next/link";
import { Search, Calendar, Package, Truck, CheckCircle } from "lucide-react";

// 임시 목 데이터
const mockOrders = [
  {
    id: "1",
    order_number: "20241125-0001",
    order_date: "2024-11-25",
    products: [
      {
        name: "GAP 인증 고랭지 설향 딸기 1kg 특품",
        quantity: 2,
      },
    ],
    total_price: 35800,
    status: "delivered",
    status_label: "배송 완료",
    delivery_method: "새벽 배송",
    delivery_scheduled_time: "2024-11-26 오전 7시",
  },
  {
    id: "2",
    order_number: "20241124-0003",
    order_date: "2024-11-24",
    products: [
      {
        name: "노르웨이 생연어 필렛 500g",
        quantity: 1,
      },
    ],
    total_price: 27000,
    status: "shipping",
    status_label: "배송 중",
    delivery_method: "일반 배송",
    delivery_scheduled_time: "2024-11-27 예정",
  },
  {
    id: "3",
    order_number: "20241123-0007",
    order_date: "2024-11-23",
    products: [
      {
        name: "무농약 아스파라거스 1단",
        quantity: 4,
      },
      {
        name: "유기농 동물복지 유정란 10구",
        quantity: 2,
      },
    ],
    total_price: 33600,
    status: "preparing",
    status_label: "준비 중",
    delivery_method: "새벽 배송",
    delivery_scheduled_time: "2024-11-25 오전 7시",
  },
];

const statusColors = {
  preparing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  shipping: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 헤더 */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          주문 내역
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          주문 상태 및 배송 정보를 확인하세요
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* 검색창 */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="상품명, 주문번호로 검색"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* 조회 기간 */}
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Calendar className="w-5 h-5" />
          <span>조회 기간 설정</span>
        </button>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium whitespace-nowrap">
          전체
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          주문 완료
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          배송 중
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          배송 완료
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          주문 취소
        </button>
      </div>

      {/* 주문 목록 */}
      <div className="space-y-4">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            {/* 주문 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    {order.order_date}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-400">·</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
                    {order.order_number}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}
                  >
                    {order.status_label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {order.delivery_method}
                  </span>
                </div>
              </div>

              <Link
                href={`/retailer/orders/${order.id}`}
                className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium hover:underline whitespace-nowrap flex-shrink-0"
              >
                상세 보기
              </Link>
            </div>

            {/* 주문 내용 */}
            <div className="py-4">
              <div className="flex flex-col gap-2">
                {order.products.map((product, index) => (
                  <p
                    key={index}
                    className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 break-words"
                  >
                    {product.name}
                    {order.products.length > 1 &&
                      index === 0 &&
                      ` 외 ${order.products.length - 1}건`}
                  </p>
                ))}
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  수량: {order.products.reduce((sum, p) => sum + p.quantity, 0)}개
                </p>
              </div>
            </div>

            {/* 주문 푸터 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  결제 금액
                </span>
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                  {order.total_price.toLocaleString()}원
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {order.status === "delivered" ? (
                  <button className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors">
                    구매 확정
                  </button>
                ) : order.status === "preparing" ? (
                  <button className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-xs sm:text-sm font-medium rounded-lg transition-colors">
                    주문 취소
                  </button>
                ) : null}
                <button className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs sm:text-sm font-medium rounded-lg transition-colors">
                  재주문
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

