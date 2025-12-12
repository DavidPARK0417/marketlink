/**
 * @file hooks/useDashboardStats.ts
 * @description 대시보드 통계 데이터 조회 훅
 *
 * 도매 대시보드의 통계 데이터를 조회하고 실시간으로 업데이트하는 React Query 훅입니다.
 *
 * 주요 기능:
 * 1. 대시보드 통계 데이터 조회 (오늘 주문, 출고 예정, 정산 예정, 전체 상품)
 * 2. 실시간 업데이트:
 *    - 새 주문 알림 (orders INSERT) → todayOrders 증가
 *    - 주문 상태 변경 (orders UPDATE) → confirmedOrders 변경
 *    - 정산 완료 (settlements UPDATE) → weeklySettlementAmount 변경
 *    - 상품 재고 변경 (products UPDATE) → 재고 부족 알림용
 * 3. 실시간 업데이트만 사용 (자동 갱신 제거)
 *
 * @dependencies
 * - @tanstack/react-query
 * - lib/supabase/realtime.ts
 * - hooks/useWholesaler.ts
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWholesaler } from "./useWholesaler";
import {
  subscribeToNewOrders,
  subscribeToOrderUpdates,
} from "@/lib/supabase/realtime";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 대시보드 통계 데이터 타입
 */
export interface DashboardStats {
  /** 오늘 주문 건수 */
  todayOrders: number;
  /** 출고 예정 건수 (status = confirmed) */
  confirmedOrders: number;
  /** 이번 주 정산 예정 금액 */
  weeklySettlementAmount: number;
  /** 전체 상품 개수 (is_active = true) */
  totalProducts: number;
}

/**
 * 대시보드 통계 데이터 조회 함수
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/wholesaler/dashboard/stats");

  if (!response.ok) {
    throw new Error("대시보드 통계 조회 실패");
  }

  return response.json();
}

/**
 * 정산 완료 구독
 *
 * 정산이 완료되면 통계를 자동으로 갱신합니다.
 * settlements 테이블의 UPDATE 이벤트를 구독합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param wholesalerId 도매점 ID
 * @param onUpdate 정산 완료 시 호출되는 콜백 함수
 * @returns 구독 해제 함수 (cleanup)
 */
function subscribeToSettlementUpdates(
  supabase: SupabaseClient,
  wholesalerId: string,
  onUpdate: () => void,
): () => void {
  const channel = supabase
    .channel(`settlement-updates-${wholesalerId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "settlements",
        filter: `wholesaler_id=eq.${wholesalerId}`,
      },
      (payload) => {
        // status가 pending → completed로 변경된 경우만
        if (
          payload.old.status === "pending" &&
          payload.new.status === "completed"
        ) {
          console.log("💰 [useDashboardStats] 정산 완료 알림:", payload.new);
          onUpdate();
        }
      },
    )
    .subscribe();

  return () => {
    console.log(
      `🧹 [useDashboardStats] Cleaning up settlement subscription: ${wholesalerId}`,
    );
    supabase.removeChannel(channel);
  };
}

/**
 * 상품 재고 변경 구독
 *
 * 상품 재고가 변경되면 재고 부족 알림을 위해 통계를 갱신합니다.
 * products 테이블의 UPDATE 이벤트를 구독합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param wholesalerId 도매점 ID
 * @param onUpdate 재고 변경 시 호출되는 콜백 함수
 * @returns 구독 해제 함수 (cleanup)
 */
function subscribeToProductStockUpdates(
  supabase: SupabaseClient,
  wholesalerId: string,
  onUpdate: () => void,
): () => void {
  const channel = supabase
    .channel(`product-stock-updates-${wholesalerId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "products",
        filter: `wholesaler_id=eq.${wholesalerId}`,
      },
      (payload) => {
        // stock_quantity가 변경된 경우만 (재고 부족 알림용)
        if (
          payload.old.stock_quantity !== payload.new.stock_quantity &&
          payload.new.stock_quantity <= 10
        ) {
          console.log(
            "📦 [useDashboardStats] 재고 부족 상품 변경 알림:",
            payload.new,
          );
          onUpdate();
        }
      },
    )
    .subscribe();

  return () => {
    console.log(
      `🧹 [useDashboardStats] Cleaning up product stock subscription: ${wholesalerId}`,
    );
    supabase.removeChannel(channel);
  };
}

/**
 * 대시보드 통계 데이터 조회 훅
 *
 * @returns 대시보드 통계 데이터 및 로딩/에러 상태
 *
 * @example
 * ```tsx
 * const { data: stats, isLoading, error } = useDashboardStats();
 *
 * if (isLoading) return <div>로딩 중...</div>;
 * if (error) return <div>에러 발생</div>;
 *
 * return (
 *   <div>
 *     <p>오늘 주문: {stats.todayOrders}건</p>
 *     <p>출고 예정: {stats.confirmedOrders}건</p>
 *   </div>
 * );
 * ```
 */
export function useDashboardStats() {
  const queryClient = useQueryClient();
  const { data: wholesaler } = useWholesaler();
  const supabase = useClerkSupabaseClient();

  // 대시보드 통계 데이터 조회
  const query = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    enabled: !!wholesaler, // 도매점 정보가 있을 때만 조회
  });

  // 실시간 업데이트 구독
  useEffect(() => {
    if (!wholesaler?.id || !supabase) {
      return;
    }

    console.log("🔔 [useDashboardStats] 실시간 구독 시작", {
      wholesalerId: wholesaler.id,
    });

    // 통계 데이터 갱신 함수
    const invalidateStats = () => {
      console.log("🔄 [useDashboardStats] 통계 데이터 갱신");
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    };

    // 1. 새 주문 구독 (INSERT)
    const unsubscribeNewOrders = subscribeToNewOrders(
      supabase,
      wholesaler.id,
      (order) => {
        console.log("🔔 [useDashboardStats] 새 주문 알림:", order);
        invalidateStats();
      },
    );

    // 2. 주문 상태 변경 구독 (UPDATE)
    const unsubscribeOrderUpdates = subscribeToOrderUpdates(
      supabase,
      wholesaler.id,
      (order) => {
        // status가 pending → confirmed로 변경된 경우만 갱신
        if (order.status === "confirmed") {
          console.log(
            "🔄 [useDashboardStats] 주문 상태 변경 (confirmed):",
            order,
          );
          invalidateStats();
        }
      },
    );

    // 3. 정산 완료 구독 (UPDATE)
    const unsubscribeSettlements = subscribeToSettlementUpdates(
      supabase,
      wholesaler.id,
      invalidateStats,
    );

    // 4. 상품 재고 변경 구독 (UPDATE) - 재고 부족 알림용
    const unsubscribeProductStock = subscribeToProductStockUpdates(
      supabase,
      wholesaler.id,
      invalidateStats,
    );

    // ⚠️ 필수: Cleanup 함수로 모든 구독 해제 (메모리 누수 방지)
    return () => {
      console.log("🧹 [useDashboardStats] Cleaning up all subscriptions");
      unsubscribeNewOrders();
      unsubscribeOrderUpdates();
      unsubscribeSettlements();
      unsubscribeProductStock();
    };
  }, [wholesaler?.id, supabase, queryClient]);

  return query;
}
