/**
 * @file components/retailer/urgent-alerts.tsx
 * @description 긴급 알림/공지 컴포넌트 (R.DASH.04)
 *
 * 대시보드에서 특정 농산물의 재고 부족 알림 또는 플랫폼 공지사항을 표시합니다.
 * 눈에 띄는 UI로 중요한 정보를 강조합니다.
 *
 * 주요 기능:
 * 1. 재고 부족 알림 배너
 * 2. 플랫폼 공지사항 배너
 * 3. 다크 모드 최적화
 *
 * @dependencies
 * - lucide-react (아이콘)
 *
 * @see {@link PRD.md} - R.DASH.04 요구사항
 */

"use client";

import { AlertTriangle, Bell, Info, X } from "lucide-react";

// 알림 타입 정의
interface Alert {
  id: string;
  type: "stock_warning" | "notice" | "info";
  title: string;
  message: string;
  created_at: string;
}

interface UrgentAlertsProps {
  alerts: Alert[];
}

// 알림 타입별 설정
const alertConfig = {
  stock_warning: {
    icon: AlertTriangle,
    iconColor: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    titleColor: "text-red-800 dark:text-red-300",
  },
  notice: {
    icon: Bell,
    iconColor: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    titleColor: "text-amber-800 dark:text-amber-300",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    titleColor: "text-blue-800 dark:text-blue-300",
  },
};

export default function UrgentAlerts({ alerts }: UrgentAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            긴급 알림
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              새로운 알림이 없습니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          긴급 알림
        </h2>
        <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
          {alerts.length}
        </span>
      </div>

      {/* 알림 리스트 */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}
            >
              <div className="flex items-start gap-3">
                {/* 아이콘 */}
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${config.titleColor}`}>
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {alert.created_at}
                  </p>
                </div>

                {/* 닫기 버튼 (옵션) */}
                <button
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="알림 닫기"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

