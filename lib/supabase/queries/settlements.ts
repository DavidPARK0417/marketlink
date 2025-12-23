"server-only";

/**
 * @file lib/supabase/queries/settlements.ts
 * @description 정산 조회 및 생성 쿼리 함수
 *
 * 정산 데이터를 조회하고 생성하는 Supabase 쿼리 함수들을 제공합니다.
 * 정산은 결제 완료 시 자동으로 생성됩니다.
 *
 * @dependencies
 * - lib/supabase/server.ts (조회용)
 * - lib/supabase/service-role.ts (생성용 - 서버 사이드 전용)
 * - types/settlement.ts
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { getUserProfile } from "@/lib/clerk/auth";
import type {
  Settlement,
  SettlementFilter,
  SettlementStats,
} from "@/types/settlement";
import type { SettlementStatus } from "@/types/database";
import type { Order } from "@/types/order";

/**
 * 정산 목록 조회 옵션
 */
export interface GetSettlementsOptions {
  page?: number;
  pageSize?: number;
  sortBy?: "created_at" | "scheduled_payout_at" | "order_amount";
  sortOrder?: "asc" | "desc";
  filter?: SettlementFilter;
}

/**
 * 정산 목록 조회 결과 (주문 정보 포함)
 */
export interface SettlementWithOrder extends Settlement {
  orders: {
    order_number: string;
    created_at: string;
    quantity: number;
    unit_price: number;
    shipping_fee: number;
    total_amount: number;
    products: {
      name: string;
      category: string;
    } | null;
    product_variants: {
      name: string;
    } | null;
  } | null;
}

/**
 * 정산 목록 조회 결과
 */
export interface GetSettlementsResult {
  settlements: SettlementWithOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 정산 목록 조회
 * 현재 도매점의 정산 내역을 조회합니다.
 */
export async function getSettlements(
  options: GetSettlementsOptions = {},
): Promise<GetSettlementsResult> {
  const {
    page = 1,
    pageSize = 20,
    sortBy = "scheduled_payout_at",
    sortOrder = "asc",
    filter = {},
  } = options;

  console.group("🔍 [settlements] 정산 목록 조회 시작");
  console.log("옵션:", { page, pageSize, sortBy, sortOrder, filter });

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매점 ID 가져오기
  console.log("🔍 [settlements] 사용자 프로필 조회 시작");
  const profile = await getUserProfile();

  if (!profile) {
    console.error(
      "❌ [settlements] 프로필 없음 - 인증되지 않았거나 프로필이 생성되지 않음",
    );
    throw new Error(
      "사용자 프로필을 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
    );
  }

  if (profile.role !== "wholesaler" && profile.role !== "admin") {
    console.error("❌ [settlements] 도매점 또는 관리자 권한 없음", { role: profile.role });
    throw new Error("도매점 또는 관리자 권한이 없습니다.");
  }

  const isAdmin = profile.role === "admin";
  const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
  
  // 관리자가 아닌 경우에만 도매점 정보 필수
  if (!isAdmin && (!wholesalers || wholesalers.length === 0)) {
    console.error("❌ [settlements] 도매점 정보 없음", {
      wholesalers,
      profileId: profile.id,
      role: profile.role,
    });
    throw new Error(
      "도매점 정보를 찾을 수 없습니다. 도매점 등록이 필요합니다.",
    );
  }

  const currentWholesalerId = isAdmin ? null : wholesalers?.[0]?.id;
  if (isAdmin) {
    console.log("✅ [settlements] 관리자 모드 - 모든 정산 조회");
  } else {
    console.log("✅ [settlements] 현재 도매점 ID:", currentWholesalerId);
  }

  const supabase = createClerkSupabaseClient();

  // 기본 쿼리 구성 (orders 테이블과 조인하여 주문 상세 정보 조회)
  // ⚠️ RLS 비활성화 환경 대응: 명시적으로 wholesaler_id 필터 추가
  // settlements.order_id → orders.id 외래키 관계
  // orders.product_id → products.id, orders.variant_id → product_variants.id
  // ⚠️ paid_at은 orders 테이블에 없고 payments 테이블에 있으므로 제외
  let query = supabase
    .from("settlements")
    .select(
      `
      *,
      orders(
        order_number,
        created_at,
        quantity,
        unit_price,
        shipping_fee,
        total_amount,
        products(name, category),
        product_variants(name)
      )
    `,
      { count: "exact" },
    );
  
  // 관리자가 아닌 경우에만 wholesaler_id 필터 적용
  if (!isAdmin && currentWholesalerId) {
    query = query.eq("wholesaler_id", currentWholesalerId);
  }
  
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // 필터 적용
  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  if (filter.start_date) {
    query = query.gte("scheduled_payout_at", filter.start_date);
  }

  if (filter.end_date) {
    // 종료일은 하루 끝까지 포함
    const endDate = new Date(filter.end_date);
    endDate.setHours(23, 59, 59, 999);
    query = query.lte("scheduled_payout_at", endDate.toISOString());
  }

  if (filter.order_id) {
    query = query.eq("order_id", filter.order_id);
  }

  // 페이지네이션
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("❌ [settlements] 정산 목록 조회 실패:", error);
    throw new Error(`정산 목록 조회 실패: ${error.message}`);
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // 정산 예정일이 지난 항목을 completed로 표시 (UI용)
  // 실제 DB 상태는 변경하지 않음
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let processedSettlements =
    (data as SettlementWithOrder[])?.map((settlement) => {
      // status가 pending이고 scheduled_payout_at이 오늘 이전이면 completed로 표시
      if (
        settlement.status === "pending" &&
        settlement.scheduled_payout_at &&
        new Date(settlement.scheduled_payout_at) < todayStart
      ) {
        console.log("📅 [settlements] 정산 예정일 경과:", {
          settlement_id: settlement.id,
          scheduled_payout_at: settlement.scheduled_payout_at,
          today: todayStart.toISOString(),
        });

        return {
          ...settlement,
          status: "completed" as SettlementStatus,
          completed_at:
            settlement.completed_at ||
            new Date(settlement.scheduled_payout_at).toISOString(),
        };
      }
      return settlement;
    }) ?? [];

  // 필터 후처리: status 필터가 "pending"이면 예정일이 지난 항목 제외
  // status 필터가 "completed"이면 예정일이 지난 pending 항목도 포함
  if (filter.status === "pending") {
    processedSettlements = processedSettlements.filter((settlement) => {
      // 예정일이 지난 항목은 제외 (이미 completed로 표시됨)
      if (
        settlement.scheduled_payout_at &&
        new Date(settlement.scheduled_payout_at) < todayStart
      ) {
        return false;
      }
      return true;
    });
  } else if (filter.status === "completed") {
    // completed 필터: DB에서 completed인 항목 + 예정일이 지난 pending 항목 모두 포함
    // 이미 위에서 예정일이 지난 항목이 completed로 변환되었으므로 그대로 사용
    processedSettlements = processedSettlements.filter(
      (settlement) => settlement.status === "completed",
    );
  }

  console.log("✅ [settlements] 정산 목록 조회 성공", {
    count: processedSettlements.length,
    total,
    page,
    totalPages,
    autoCompletedCount: processedSettlements.filter(
      (s) =>
        s.status === "completed" &&
        data?.find((d) => d.id === s.id)?.status === "pending",
    ).length,
  });
  console.groupEnd();

  return {
    settlements: processedSettlements,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * 정산 상태 변경
 *
 * @param settlementId 정산 ID
 * @param status 새로운 상태
 * @returns 업데이트된 정산 정보
 */
export async function updateSettlementStatus(
  settlementId: string,
  status: SettlementStatus,
): Promise<Settlement> {
  console.group("🔄 [settlements] 정산 상태 변경 시작");
  console.log("settlementId:", settlementId);
  console.log("status:", status);

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매점 ID 가져오기
  const profile = await getUserProfile();

  if (!profile) {
    console.error(
      "❌ [settlements] 프로필 없음 - 인증되지 않았거나 프로필이 생성되지 않음",
    );
    throw new Error(
      "사용자 프로필을 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
    );
  }

  if (profile.role !== "wholesaler" && profile.role !== "admin") {
    console.error("❌ [settlements] 도매점 또는 관리자 권한 없음", { role: profile.role });
    throw new Error("도매점 또는 관리자 권한이 없습니다.");
  }

  const isAdmin = profile.role === "admin";
  const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
  
  // 관리자가 아닌 경우에만 도매점 정보 필수
  if (!isAdmin && (!wholesalers || wholesalers.length === 0)) {
    console.error("❌ [settlements] 도매점 정보 없음", {
      wholesalers,
      profileId: profile.id,
      role: profile.role,
    });
    throw new Error(
      "도매점 정보를 찾을 수 없습니다. 도매점 등록이 필요합니다.",
    );
  }

  const currentWholesalerId = isAdmin ? null : wholesalers?.[0]?.id;
  if (isAdmin) {
    console.log("✅ [settlements] 관리자 모드 - 모든 정산 상태 변경 가능");
  } else {
    console.log("✅ [settlements] 현재 도매점 ID:", currentWholesalerId);
  }

  const supabase = createClerkSupabaseClient();

  // 상태에 따라 completed_at 설정
  const updateData: {
    status: SettlementStatus;
    completed_at?: string | null;
  } = {
    status,
  };

  if (status === "completed") {
    // completed로 변경 시 현재 시간 설정
    updateData.completed_at = new Date().toISOString();
    console.log("📅 [settlements] 정산 완료일 설정:", updateData.completed_at);
  } else if (status === "pending") {
    // pending으로 변경 시 completed_at을 null로 설정
    updateData.completed_at = null;
    console.log("📅 [settlements] 정산 완료일 초기화");
  }

  // 쿼리 빌더 시작
  let query = supabase
    .from("settlements")
    .update(updateData)
    .eq("id", settlementId);

  // 관리자가 아닌 경우에만 wholesaler_id 필터 적용
  if (!isAdmin && currentWholesalerId) {
    query = query.eq("wholesaler_id", currentWholesalerId);
    console.log("🔒 [settlements] 도매점 필터 적용:", currentWholesalerId);
  } else if (isAdmin) {
    console.log("🔓 [settlements] 관리자 모드 - 모든 정산 변경 가능");
  }

  // 업데이트 실행 및 업데이트된 데이터 조회
  // .select()를 사용하여 배열로 받고, 첫 번째 요소 확인
  const { data: updatedRows, error: updateError } = await query.select();

  if (updateError) {
    console.error("❌ [settlements] 정산 상태 변경 오류:", updateError);
    console.groupEnd();
    throw new Error(`정산 상태 변경 실패: ${updateError.message}`);
  }

  // 업데이트된 행이 없는 경우 확인
  if (!updatedRows || updatedRows.length === 0) {
    console.error("❌ [settlements] 업데이트된 행이 없음", {
      settlementId,
      currentWholesalerId,
      isAdmin,
    });
    console.groupEnd();
    throw new Error(
      "정산 상태를 변경할 수 없습니다. 권한이 없거나 정산 정보를 찾을 수 없습니다.",
    );
  }

  const data = updatedRows[0];

  console.log("✅ [settlements] 정산 상태 변경 완료", {
    settlementId,
    status,
    completed_at: data.completed_at,
    isAdmin,
  });
  console.groupEnd();

  return data as Settlement;
}

/**
 * 정산 상세 조회
 */
export async function getSettlementById(
  settlementId: string,
): Promise<Settlement | null> {
  console.log("🔍 [settlements] 정산 상세 조회:", settlementId);

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매점 ID 가져오기
  const profile = await getUserProfile();

  if (!profile) {
    console.error(
      "❌ [settlements] 프로필 없음 - 인증되지 않았거나 프로필이 생성되지 않음",
    );
    throw new Error(
      "사용자 프로필을 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
    );
  }

  if (profile.role !== "wholesaler") {
    console.error("❌ [settlements] 도매점 권한 없음", { role: profile.role });
    throw new Error("도매점 권한이 없습니다.");
  }

  const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
  if (!wholesalers || wholesalers.length === 0) {
    console.error("❌ [settlements] 도매점 정보 없음");
    throw new Error(
      "도매점 정보를 찾을 수 없습니다. 도매점 등록이 필요합니다.",
    );
  }

  const currentWholesalerId = wholesalers[0].id;
  console.log("✅ [settlements] 현재 도매점 ID:", currentWholesalerId);

  const supabase = createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("settlements")
    .select("*")
    .eq("id", settlementId)
    .eq("wholesaler_id", currentWholesalerId) // ⚠️ RLS 비활성화 환경 대응
    .single();

  if (error) {
    console.error("❌ [settlements] 정산 상세 조회 실패:", error);
    throw new Error(`정산 상세 조회 실패: ${error.message}`);
  }

  // 정산 예정일이 지난 항목을 completed로 표시 (UI용)
  if (data) {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    if (
      data.status === "pending" &&
      data.scheduled_payout_at &&
      new Date(data.scheduled_payout_at) < todayStart
    ) {
      console.log("📅 [settlements] 정산 예정일 경과 (상세):", {
        settlement_id: data.id,
        scheduled_payout_at: data.scheduled_payout_at,
        today: todayStart.toISOString(),
      });

      return {
        ...data,
        status: "completed" as SettlementStatus,
        completed_at:
          data.completed_at || new Date(data.scheduled_payout_at).toISOString(),
      } as Settlement;
    }
  }

  console.log("✅ [settlements] 정산 상세 조회 성공");
  return data as Settlement | null;
}

/**
 * 정산 생성 함수
 * 결제 완료 시 자동으로 호출됩니다.
 *
 * ⚠️ 중요: 이 함수는 서버 사이드에서만 호출해야 합니다.
 * (API 라우트, Server Action 등)
 */
export async function createSettlement(
  order: Order & { paid_at: string },
): Promise<Settlement> {
  console.group("💰 [settlements] 정산 생성 시작");
  console.log("주문 정보:", {
    order_id: order.id,
    wholesaler_id: order.wholesaler_id,
    total_amount: order.total_amount,
    paid_at: order.paid_at,
  });

  // Service Role 클라이언트 사용 (RLS 우회)
  const supabase = getServiceRoleClient();

  // 환경 변수에서 수수료율 가져오기
  const platformFeeRate = parseFloat(
    process.env.NEXT_PUBLIC_PLATFORM_FEE_RATE || "0.05",
  );

  // 정산 계산
  const platformFee = Math.floor(order.total_amount * platformFeeRate);
  const wholesalerAmount = order.total_amount - platformFee;

  // 정산 예정일: 결제일 + 7일 (D+7)
  const scheduledPayoutAt = new Date(order.paid_at);
  scheduledPayoutAt.setDate(scheduledPayoutAt.getDate() + 7);

  console.log("정산 계산 결과:", {
    order_amount: order.total_amount,
    platform_fee_rate: platformFeeRate,
    platform_fee: platformFee,
    wholesaler_amount: wholesalerAmount,
    scheduled_payout_at: scheduledPayoutAt.toISOString(),
  });

  // 정산 데이터 삽입
  const { data, error } = await supabase
    .from("settlements")
    .insert({
      order_id: order.id,
      wholesaler_id: order.wholesaler_id,
      order_amount: order.total_amount,
      platform_fee_rate: platformFeeRate,
      platform_fee: platformFee,
      wholesaler_amount: wholesalerAmount,
      status: "pending",
      scheduled_payout_at: scheduledPayoutAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("❌ [settlements] 정산 생성 실패:", error);
    throw new Error(`정산 생성 실패: ${error.message}`);
  }

  console.log("✅ [settlements] 정산 생성 성공:", data.id);
  console.groupEnd();

  return data as Settlement;
}

/**
 * 테스트용 더미 정산 데이터 생성
 * 개발/테스트 환경에서만 사용하세요.
 */
export async function createTestSettlement(
  orderId: string,
  wholesalerId: string,
  orderAmount: number = 100000,
  options: {
    platformFeeRate?: number;
    daysToPayout?: number;
    status?: SettlementStatus;
  } = {},
): Promise<Settlement> {
  console.group("🧪 [settlements] 테스트 정산 데이터 생성");
  console.log("테스트 데이터 옵션:", {
    orderId,
    wholesalerId,
    orderAmount,
    ...options,
  });

  const supabase = getServiceRoleClient();

  const platformFeeRate = options.platformFeeRate ?? 0.05;
  const daysToPayout = options.daysToPayout ?? 7;
  const status = options.status ?? "pending";

  const platformFee = Math.floor(orderAmount * platformFeeRate);
  const wholesalerAmount = orderAmount - platformFee;

  const scheduledPayoutAt = new Date();
  scheduledPayoutAt.setDate(scheduledPayoutAt.getDate() + daysToPayout);

  const { data, error } = await supabase
    .from("settlements")
    .insert({
      order_id: orderId,
      wholesaler_id: wholesalerId,
      order_amount: orderAmount,
      platform_fee_rate: platformFeeRate,
      platform_fee: platformFee,
      wholesaler_amount: wholesalerAmount,
      status,
      scheduled_payout_at: scheduledPayoutAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("❌ [settlements] 테스트 정산 생성 실패:", error);
    throw new Error(`테스트 정산 생성 실패: ${error.message}`);
  }

  console.log("✅ [settlements] 테스트 정산 생성 성공:", data.id);
  console.groupEnd();

  return data as Settlement;
}

/**
 * 정산 통계 조회
 * 현재 도매점의 정산 통계를 조회합니다.
 */
export async function getSettlementStats(): Promise<SettlementStats> {
  console.log("🔍 [settlements] 정산 통계 조회");

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매점 ID 가져오기
  const profile = await getUserProfile();

  if (!profile) {
    console.error(
      "❌ [settlements] 프로필 없음 - 인증되지 않았거나 프로필이 생성되지 않음",
    );
    throw new Error(
      "사용자 프로필을 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
    );
  }

  if (profile.role !== "wholesaler" && profile.role !== "admin") {
    console.error("❌ [settlements] 도매점 또는 관리자 권한 없음", { role: profile.role });
    throw new Error("도매점 또는 관리자 권한이 없습니다.");
  }

  const isAdmin = profile.role === "admin";
  const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
  
  // 관리자가 아닌 경우에만 도매점 정보 필수
  if (!isAdmin && (!wholesalers || wholesalers.length === 0)) {
    console.error("❌ [settlements] 도매점 정보 없음");
    throw new Error(
      "도매점 정보를 찾을 수 없습니다. 도매점 등록이 필요합니다.",
    );
  }

  const currentWholesalerId = isAdmin ? null : wholesalers?.[0]?.id;
  if (isAdmin) {
    console.log("✅ [settlements] 관리자 모드 - 모든 정산 통계 조회");
  } else {
    console.log("✅ [settlements] 현재 도매점 ID:", currentWholesalerId);
  }

  const supabase = createClerkSupabaseClient();

  // 모든 정산 데이터 조회 (예정일 기준으로 자동 완료 처리)
  let statsQuery = supabase
    .from("settlements")
    .select("status, wholesaler_amount, platform_fee, scheduled_payout_at");
  
  // 관리자가 아닌 경우에만 wholesaler_id 필터 적용
  if (!isAdmin && currentWholesalerId) {
    statsQuery = statsQuery.eq("wholesaler_id", currentWholesalerId);
  }
  
  const { data: allSettlements, error: allError } = await statsQuery;

  if (allError) {
    console.error("❌ [settlements] 정산 통계 조회 실패:", allError);
    throw new Error(`정산 통계 조회 실패: ${allError.message}`);
  }

  // 정산 예정일이 지난 항목을 completed로 계산 (UI용)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let pendingAmount = 0;
  let completedAmount = 0;
  let pendingCount = 0;
  let completedCount = 0;
  let totalPlatformFee = 0;

  allSettlements?.forEach((settlement) => {
    // 예정일이 지난 pending 항목은 completed로 처리
    const isOverdue =
      settlement.status === "pending" &&
      settlement.scheduled_payout_at &&
      new Date(settlement.scheduled_payout_at) < todayStart;

    const effectiveStatus = isOverdue ? "completed" : settlement.status;
    const amount = settlement.wholesaler_amount ?? 0;
    const fee = settlement.platform_fee ?? 0;

    if (effectiveStatus === "completed") {
      completedAmount += amount;
      completedCount++;
    } else {
      pendingAmount += amount;
      pendingCount++;
    }

    totalPlatformFee += fee;
  });

  const stats: SettlementStats = {
    total_amount: pendingAmount + completedAmount,
    total_platform_fee: totalPlatformFee,
    total_wholesaler_amount: pendingAmount + completedAmount,
    pending_amount: pendingAmount,
    completed_amount: completedAmount,
    pending_count: pendingCount,
    completed_count: completedCount,
  };

  console.log("✅ [settlements] 정산 통계 조회 성공:", {
    ...stats,
    autoCompletedCount:
      allSettlements?.filter(
        (s) =>
          s.status === "pending" &&
          s.scheduled_payout_at &&
          new Date(s.scheduled_payout_at) < todayStart,
      ).length ?? 0,
  });
  return stats;
}
