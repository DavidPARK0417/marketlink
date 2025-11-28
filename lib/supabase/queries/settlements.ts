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
    paid_at: string | null;
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

  if (profile.role !== "wholesaler") {
    console.error("❌ [settlements] 도매점 권한 없음", { role: profile.role });
    throw new Error("도매점 권한이 없습니다.");
  }

  const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
  if (!wholesalers || wholesalers.length === 0) {
    console.error("❌ [settlements] 도매점 정보 없음", {
      wholesalers,
      profileId: profile.id,
      role: profile.role,
    });
    throw new Error(
      "도매점 정보를 찾을 수 없습니다. 도매점 등록이 필요합니다.",
    );
  }

  const currentWholesalerId = wholesalers[0].id;
  console.log("✅ [settlements] 현재 도매점 ID:", currentWholesalerId);

  const supabase = createClerkSupabaseClient();

  // 기본 쿼리 구성 (orders 테이블과 조인하여 주문 상세 정보 조회)
  // ⚠️ RLS 비활성화 환경 대응: 명시적으로 wholesaler_id 필터 추가
  // settlements.order_id → orders.id 외래키 관계
  // orders.product_id → products.id, orders.variant_id → product_variants.id
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
        paid_at,
        products(name, category),
        product_variants(name)
      )
    `,
      { count: "exact" },
    )
    .eq("wholesaler_id", currentWholesalerId)
    .order(sortBy, { ascending: sortOrder === "asc" });

  // 필터 적용
  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  if (filter.start_date) {
    query = query.gte("scheduled_payout_at", filter.start_date);
  }

  if (filter.end_date) {
    query = query.lte("scheduled_payout_at", filter.end_date);
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

  console.log("✅ [settlements] 정산 목록 조회 성공", {
    count: data?.length ?? 0,
    total,
    page,
    totalPages,
  });
  console.groupEnd();

  return {
    settlements: (data as SettlementWithOrder[]) ?? [],
    total,
    page,
    pageSize,
    totalPages,
  };
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

  // 정산 예정 (pending) 통계
  const { data: pendingData, error: pendingError } = await supabase
    .from("settlements")
    .select("wholesaler_amount, platform_fee")
    .eq("wholesaler_id", currentWholesalerId) // ⚠️ RLS 비활성화 환경 대응
    .eq("status", "pending");

  if (pendingError) {
    console.error("❌ [settlements] 정산 예정 통계 조회 실패:", pendingError);
    throw new Error(`정산 통계 조회 실패: ${pendingError.message}`);
  }

  // 정산 완료 (completed) 통계
  const { data: completedData, error: completedError } = await supabase
    .from("settlements")
    .select("wholesaler_amount, platform_fee")
    .eq("wholesaler_id", currentWholesalerId) // ⚠️ RLS 비활성화 환경 대응
    .eq("status", "completed");

  if (completedError) {
    console.error("❌ [settlements] 정산 완료 통계 조회 실패:", completedError);
    throw new Error(`정산 통계 조회 실패: ${completedError.message}`);
  }

  const totalPendingAmount =
    pendingData?.reduce((sum, s) => sum + (s.wholesaler_amount ?? 0), 0) ?? 0;
  const totalCompletedAmount =
    completedData?.reduce((sum, s) => sum + (s.wholesaler_amount ?? 0), 0) ?? 0;
  const totalPlatformFee =
    (pendingData?.reduce((sum, s) => sum + (s.platform_fee ?? 0), 0) ?? 0) +
    (completedData?.reduce((sum, s) => sum + (s.platform_fee ?? 0), 0) ?? 0);

  const stats: SettlementStats = {
    total_amount: totalPendingAmount + totalCompletedAmount,
    total_platform_fee: totalPlatformFee,
    total_wholesaler_amount: totalPendingAmount + totalCompletedAmount,
    pending_amount: totalPendingAmount,
    completed_amount: totalCompletedAmount,
    pending_count: pendingData?.length ?? 0,
    completed_count: completedData?.length ?? 0,
  };

  console.log("✅ [settlements] 정산 통계 조회 성공:", stats);
  return stats;
}
