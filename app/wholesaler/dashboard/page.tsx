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
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

/**
 * 대시보드 통계 데이터 타입
 */
interface DashboardStats {
  todayOrders: number;
  todayOrdersTrend?: number;
  confirmedOrders: number;
  weeklySettlementAmount: number;
  weeklySettlementTrend?: number;
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

  const todayOrders = stats?.todayOrders ?? 0;
  const todayOrdersTrend = stats?.todayOrdersTrend;
  const confirmedOrders = stats?.confirmedOrders ?? 0;
  const weeklySettlementAmount = stats?.weeklySettlementAmount ?? 0;
  const weeklySettlementTrend = stats?.weeklySettlementTrend;
  const totalProducts = stats?.totalProducts ?? 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 알림 배너 - 신규 주문 with 3D */}
      {!isStatsLoading && todayOrders > 0 && (
        <div className="relative bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] text-white rounded-3xl p-4 lg:p-5 shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.4)] transition-all duration-300 hover:-translate-y-1 border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 rounded-3xl"></div>
          <div className="relative flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl shadow-lg">
              <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base lg:text-lg drop-shadow-md">
                신규 주문 {todayOrders}건의 발주 확인이 필요합니다.
              </h3>
              <p className="text-xs lg:text-sm mt-0.5 opacity-90">
                빠른 처리로 고객 만족도를 높이세요.
              </p>
            </div>
            <ChevronRight className="w-6 h-6 flex-shrink-0 drop-shadow-lg" />
          </div>
        </div>
      )}

      {/* 간편 통계 카드 - 3D Effect */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* 오늘 신규 주문 */}
        <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 lg:p-6 hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 dark:border-gray-800 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            {isStatsLoading ? (
              <div className="space-y-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                  📦
                </div>
                <p className="text-xs lg:text-sm text-[#6B7280] dark:text-gray-300 font-semibold mb-2">
                  오늘 신규 주문
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground dark:text-foreground mb-2">
                  {todayOrders}건
                </p>
                {todayOrdersTrend !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full w-fit ${
                      todayOrdersTrend >= 0
                        ? "text-[#10B981] bg-[#10B981]/10"
                        : "text-red-500 bg-red-500/10"
                    }`}
                  >
                    {todayOrdersTrend >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {todayOrdersTrend >= 0 ? "+" : ""}
                      {todayOrdersTrend.toFixed(1)}%
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 출고 예정 */}
        <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 lg:p-6 hover:shadow-[0_20px_50px_rgba(251,191,36,0.2)] transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 dark:border-gray-800 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            {isStatsLoading ? (
              <div className="space-y-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                  ⏰
                </div>
                <p className="text-xs lg:text-sm text-[#6B7280] dark:text-gray-300 font-semibold mb-2">
                  출고 예정
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground dark:text-foreground mb-2">
                  {confirmedOrders}건
                </p>
                <div className="text-xs text-[#fbbf24] font-semibold bg-[#fbbf24]/10 px-2 py-1 rounded-full w-fit">
                  처리 필요
                </div>
              </>
            )}
          </div>
        </div>

        {/* 이번 주 정산 */}
        <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 lg:p-6 hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 dark:border-gray-800 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            {isStatsLoading ? (
              <div className="space-y-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                  💰
                </div>
                <p className="text-xs lg:text-sm text-[#6B7280] dark:text-gray-300 font-semibold mb-2">
                  이번 주 정산
                </p>
                <p className="text-xl lg:text-2xl font-bold text-foreground dark:text-foreground mb-2">
                  {(weeklySettlementAmount / 10000).toFixed(0)}만원
                </p>
                {weeklySettlementTrend !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full w-fit ${
                      weeklySettlementTrend >= 0
                        ? "text-[#10B981] bg-[#10B981]/10"
                        : "text-red-500 bg-red-500/10"
                    }`}
                  >
                    {weeklySettlementTrend >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {weeklySettlementTrend >= 0 ? "+" : ""}
                      {weeklySettlementTrend.toFixed(1)}%
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 등록 상품 */}
        <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 lg:p-6 hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)] transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 dark:border-gray-800 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            {isStatsLoading ? (
              <div className="space-y-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                  🏪
                </div>
                <p className="text-xs lg:text-sm text-[#6B7280] dark:text-gray-300 font-semibold mb-2">
                  등록 상품
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground dark:text-foreground mb-2">
                  {totalProducts}개
                </p>
                <div className="text-xs text-[#6B7280] dark:text-gray-300 font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full w-fit">
                  관리 중
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {statsError && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/40 p-4 transition-colors duration-200">
          <p className="text-sm text-red-800 dark:text-red-200">
            통계 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시
            시도해주세요.
          </p>
        </div>
      )}

      {/* 최근 주문 및 재고 부족 알림 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

        {/* 최근 주문 */}
        <Suspense fallback={<RecentOrdersSkeleton />}>
          <RecentOrders />
        </Suspense>
      </div>
    </div>
  );
}
