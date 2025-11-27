/**
 * @file app/wholesaler/dashboard/page.tsx
 * @description 도매 대시보드 페이지
 *
 * 도매업자의 메인 대시보드입니다.
 *
 * 주요 기능:
 * 1. 최근 주문 5개 표시
 * 2. 향후 통계 카드 추가 예정
 * 3. 출고 예정 목록 (예정)
 * 4. 정산 요약 (예정)
 *
 * @dependencies
 * - components/common/PageHeader.tsx
 * - components/wholesaler/Dashboard/RecentOrders.tsx
 * - components/wholesaler/Dashboard/RecentOrdersSkeleton.tsx
 */

import { Suspense } from "react";
import PageHeader from "@/components/common/PageHeader";
import RecentOrders from "@/components/wholesaler/Dashboard/RecentOrders";
import RecentOrdersSkeleton from "@/components/wholesaler/Dashboard/RecentOrdersSkeleton";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="오늘의 주문, 출고 예정, 정산 요약을 확인하세요."
      />

      {/* 최근 주문 */}
      <Suspense fallback={<RecentOrdersSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}
