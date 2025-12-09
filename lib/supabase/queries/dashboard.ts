"server-only";

/**
 * @file lib/supabase/queries/dashboard.ts
 * @description 대시보드 통계 데이터 조회 함수
 *
 * 도매 대시보드에서 사용하는 통계 데이터를 조회하는 함수들을 제공합니다.
 *
 * @dependencies
 * - lib/supabase/server.ts
 * - lib/clerk/auth.ts
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/clerk/auth";

/**
 * 대시보드 통계 데이터 타입
 */
export interface DashboardStats {
  /** 오늘 주문 건수 */
  todayOrders: number;
  /** 출고 예정 건수 (status = confirmed) */
  confirmedOrders: number;
  /** 이번 주 정산 예정 금액 (settlements, status = pending, scheduled_payout_at 기준) */
  weeklySettlementAmount: number;
  /** 전체 상품 개수 (is_active = true) */
  totalProducts: number;
}

/**
 * 대시보드 통계 데이터 조회
 *
 * 현재 도매점의 대시보드 통계를 조회합니다.
 *
 * @returns 대시보드 통계 데이터
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  console.log("📊 [dashboard-query] 대시보드 통계 조회 시작");

  // 현재 도매점 ID 확인
  const profile = await getUserProfile();

  if (!profile || (profile.role !== "wholesaler" && profile.role !== "admin")) {
    throw new Error("도매점 권한이 없습니다.");
  }

  const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
  if (!wholesalers || wholesalers.length === 0) {
    // 관리자 모드에서 도매점이 아직 없을 때는 빈 통계 반환 (에러 대신 0으로 표시)
    if (profile.role === "admin") {
      console.log(
        "ℹ️ [dashboard-query] 관리자 계정 - 연결된 도매점 없음, 기본 통계 반환",
      );
      return {
        todayOrders: 0,
        confirmedOrders: 0,
        weeklySettlementAmount: 0,
        totalProducts: 0,
      };
    }

    throw new Error("도매점 정보를 찾을 수 없습니다.");
  }

  const currentWholesalerId = wholesalers[0].id;
  console.log("✅ [dashboard-query] 현재 도매점 ID:", currentWholesalerId);

  const supabase = createClerkSupabaseClient();

  // 오늘 날짜 범위 계산
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.toISOString();
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const todayEndISO = todayEnd.toISOString();

  // 이번 주 날짜 범위 계산 (월요일부터 일요일까지)
  const weekStart = new Date(today);
  const dayOfWeek = weekStart.getDay(); // 0 = 일요일, 1 = 월요일, ...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 월요일까지의 일수
  weekStart.setDate(weekStart.getDate() - daysToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartISO = weekStart.toISOString();

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  const weekEndISO = weekEnd.toISOString();

  console.log("📅 [dashboard-query] 날짜 범위:", {
    todayStart,
    todayEndISO,
    weekStartISO,
    weekEndISO,
  });

  // 1. 오늘 주문 건수 조회
  const { count: todayOrdersCount, error: todayOrdersError } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("wholesaler_id", currentWholesalerId)
    .gte("created_at", todayStart)
    .lte("created_at", todayEndISO);

  if (todayOrdersError) {
    console.error(
      "❌ [dashboard-query] 오늘 주문 조회 오류:",
      todayOrdersError,
    );
    throw new Error(`오늘 주문 조회 실패: ${todayOrdersError.message}`);
  }

  // 2. 출고 예정 건수 조회 (status = confirmed)
  const { count: confirmedOrdersCount, error: confirmedOrdersError } =
    await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("wholesaler_id", currentWholesalerId)
      .eq("status", "confirmed");

  if (confirmedOrdersError) {
    console.error(
      "❌ [dashboard-query] 출고 예정 주문 조회 오류:",
      confirmedOrdersError,
    );
    throw new Error(
      `출고 예정 주문 조회 실패: ${confirmedOrdersError.message}`,
    );
  }

  // 3. 이번 주 정산 예정 금액 조회 (settlements, status = pending, scheduled_payout_at 기준)
  const { data: settlementsData, error: settlementsError } = await supabase
    .from("settlements")
    .select("wholesaler_amount")
    .eq("wholesaler_id", currentWholesalerId)
    .eq("status", "pending")
    .gte("scheduled_payout_at", weekStartISO)
    .lte("scheduled_payout_at", weekEndISO);

  if (settlementsError) {
    console.error(
      "❌ [dashboard-query] 정산 예정 금액 조회 오류:",
      settlementsError,
    );
    throw new Error(`정산 예정 금액 조회 실패: ${settlementsError.message}`);
  }

  // 정산 예정 금액 합계 계산
  const weeklySettlementAmount =
    settlementsData?.reduce(
      (sum, settlement) => sum + (settlement.wholesaler_amount || 0),
      0,
    ) ?? 0;

  // 4. 전체 상품 개수 조회 (is_active = true)
  const { count: totalProductsCount, error: totalProductsError } =
    await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("wholesaler_id", currentWholesalerId)
      .eq("is_active", true);

  if (totalProductsError) {
    console.error(
      "❌ [dashboard-query] 전체 상품 조회 오류:",
      totalProductsError,
    );
    throw new Error(`전체 상품 조회 실패: ${totalProductsError.message}`);
  }

  const stats: DashboardStats = {
    todayOrders: todayOrdersCount ?? 0,
    confirmedOrders: confirmedOrdersCount ?? 0,
    weeklySettlementAmount,
    totalProducts: totalProductsCount ?? 0,
  };

  console.log("✅ [dashboard-query] 대시보드 통계 조회 완료", stats);

  return stats;
}
