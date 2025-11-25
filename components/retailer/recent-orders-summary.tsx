/**
 * @file components/retailer/recent-orders-summary.tsx
 * @description 최근 주문 요약 컴포넌트 (R.DASH.03)
 *
 * 대시보드에서 최근 완료되거나 진행 중인 주문 3건을 요약 표시합니다.
 * 타임라인 UI 축약본으로 주문 상태를 시각적으로 표시합니다.
 *
 * 주요 기능:
 * 1. 최근 주문 3건 표시
 * 2. 주문 상태별 색상/아이콘
 * 3. 배송 상태 표시 (새벽 배송 준비 중, 일반 배송 중)
 *
 * @dependencies
 * - next/link (Link)
 * - lucide-react (아이콘)
 *
 * @see {@link PRD.md} - R.DASH.03 요구사항
 */

"use client";

import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, ArrowRight } from "lucide-react";

// 주문 타입 정의
interface RecentOrder {
  id: string;
  order_number: string;
  product_name: string;
  status: "preparing" | "shipping" | "delivered";
  status_label: string;
  delivery_method: string;
  delivery_scheduled_time: string;
  total_price: number;
}

interface RecentOrdersSummaryProps {
  orders: RecentOrder[];
}

// 상태별 설정
const statusConfig = {
  preparing: {
    icon: Package,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  shipping: {
    icon: Truck,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  delivered: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
};

export default function RecentOrdersSummary({ orders }: RecentOrdersSummaryProps) {
  if (orders.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            최근 주문
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            주문 내역이 없습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          최근 주문
        </h2>
        <Link
          href="/retailer/orders"
          className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:underline"
        >
          <span>전체 보기</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 주문 리스트 */}
      <div className="flex-1 space-y-3">
        {orders.slice(0, 3).map((order) => {
          const config = statusConfig[order.status];
          const Icon = config.icon;

          return (
            <Link
              key={order.id}
              href={`/retailer/orders/${order.id}`}
              className={`block p-3 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start gap-3">
                {/* 상태 아이콘 */}
                <div className={`p-2 rounded-full ${config.bgColor}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>

                {/* 주문 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {order.product_name}
                    </p>
                    <span className={`text-xs font-medium ${config.color} whitespace-nowrap`}>
                      {order.status_label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {order.delivery_method}
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{order.delivery_scheduled_time}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {order.total_price.toLocaleString()}원
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

