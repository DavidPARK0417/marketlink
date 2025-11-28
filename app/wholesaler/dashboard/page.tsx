/**
 * @file app/wholesaler/dashboard/page.tsx
 * @description 도매 대시보드 페이지
 *
 * 도매업자의 메인 대시보드입니다.
 *
 * 주요 기능:
 * 1. 통계 카드 4개 (오늘 주문, 출고 예정, 이번 주 정산 예정, 전체 상품)
 * 2. 최근 주문 5개 표시
 * 3. 재고 부족 알림 섹션
 * 4. 실시간 주문 알림 (Supabase Realtime)
 *
 * @dependencies
 * - components/common/PageHeader.tsx
 * - components/wholesaler/Dashboard/StatCard.tsx
 * - components/wholesaler/Dashboard/RecentOrders.tsx
 * - components/wholesaler/Dashboard/LowStockAlert.tsx
 * - lib/supabase/realtime.ts
 */

"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { subscribeToNewOrders } from "@/lib/supabase/realtime";
import { useWholesaler } from "@/hooks/useWholesaler";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/wholesaler/Dashboard/StatCard";
import RecentOrders from "@/components/wholesaler/Dashboard/RecentOrders";
import RecentOrdersSkeleton from "@/components/wholesaler/Dashboard/RecentOrdersSkeleton";
import LowStockAlert from "@/components/wholesaler/Dashboard/LowStockAlert";
import {
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  Loader2,
} from "lucide-react";

/**
 * 대시보드 통계 데이터 타입
 */
interface DashboardStats {
  todayOrders: number;
  confirmedOrders: number;
  weeklySettlementAmount: number;
  totalProducts: number;
}

/**
 * 대시보드 통계 데이터 조회 함수 (클라이언트)
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/wholesaler/dashboard/stats");
  if (!response.ok) {
    throw new Error("대시보드 통계 조회 실패");
  }
  return response.json();
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const { data: wholesaler, error: wholesalerError } = useWholesaler();

  // 대시보드 통계 데이터 조회
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });

  // 에러 로깅
  useEffect(() => {
    if (wholesalerError) {
      console.error(
        "❌ [dashboard] 도매점 정보 조회 오류:",
        wholesalerError instanceof Error
          ? wholesalerError.message
          : JSON.stringify(wholesalerError, null, 2),
      );
    }
  }, [wholesalerError]);

  const wholesalerId = wholesaler?.id ?? null;

  // 실시간 주문 알림 구독
  useEffect(() => {
    if (!wholesalerId || !supabase) return;

    console.log("🔔 [dashboard] 새 주문 구독 시작", { wholesalerId });

    const unsubscribe = subscribeToNewOrders(
      supabase,
      wholesalerId,
      (order) => {
        console.log("🔔 [dashboard] 새 주문 알림:", order);

        // 토스트 알림 표시
        toast.success("새 주문이 들어왔습니다! 🎉", {
          description: `주문번호: ${order.order_number}`,
          action: {
            label: "확인하기",
            onClick: () => router.push(`/wholesaler/orders/${order.id}`),
          },
        });
      },
    );

    // ⚠️ 필수: Cleanup 함수로 구독 해제 (메모리 누수 방지)
    return () => {
      console.log("🧹 [dashboard] Cleaning up order subscription");
      unsubscribe();
    };
  }, [wholesalerId, supabase, router]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="오늘의 주문, 출고 예정, 정산 요약을 확인하세요."
        hideTitle={true}
      />

      {/* 통계 카드 4개 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="오늘 주문"
          value={isStatsLoading ? "..." : stats?.todayOrders ?? 0}
          icon={ShoppingCart}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="출고 예정"
          value={isStatsLoading ? "..." : stats?.confirmedOrders ?? 0}
          icon={Truck}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="이번 주 정산 예정"
          value={
            isStatsLoading
              ? "..."
              : `${new Intl.NumberFormat("ko-KR").format(
                  stats?.weeklySettlementAmount ?? 0,
                )}원`
          }
          icon={DollarSign}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="전체 상품"
          value={isStatsLoading ? "..." : stats?.totalProducts ?? 0}
          icon={Package}
          isLoading={isStatsLoading}
        />
      </div>

      {/* 에러 메시지 */}
      {statsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            통계 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시
            시도해주세요.
          </p>
        </div>
      )}

      {/* 최근 주문 및 재고 부족 알림 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 최근 주문 */}
        <Suspense fallback={<RecentOrdersSkeleton />}>
          <RecentOrders />
        </Suspense>

        {/* 재고 부족 알림 */}
        <Suspense
          fallback={
            <div className="rounded-lg border p-6">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">
                  재고 정보를 불러오는 중...
                </p>
              </div>
            </div>
          }
        >
          <LowStockAlert />
        </Suspense>
      </div>
    </div>
  );
}
