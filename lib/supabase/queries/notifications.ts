/**
 * @file lib/supabase/queries/notifications.ts
 * @description 알림 관련 쿼리 함수
 *
 * 도매점의 주문 및 문의 알림을 관리하는 Supabase 쿼리 함수들을 제공합니다.
 * 읽지 않은 주문/문의 개수 조회, 최근 주문/문의 목록 조회, 읽음 처리 등을 포함합니다.
 *
 * @dependencies
 * - lib/supabase/clerk-client.ts
 * - types/order.ts
 * - types/inquiry.ts
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderDetail } from "@/types/order";

/**
 * 읽지 않은 주문 개수 조회 결과
 */
export interface UnreadOrdersCount {
  count: number;
}

/**
 * 최근 주문 알림 타입 (읽음 여부 포함)
 */
export interface OrderNotification extends OrderDetail {
  wholesaler_read_at: string | null;
  is_read: boolean; // 계산된 필드 (wholesaler_read_at !== null)
}

/**
 * 현재 도매점의 읽지 않은 주문 개수 조회
 *
 * RLS 정책을 통해 현재 로그인한 도매점의 주문만 조회됩니다.
 * wholesaler_read_at이 NULL인 주문만 카운트합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param wholesalerId 도매점 ID
 * @returns 읽지 않은 주문 개수
 */
export async function getUnreadOrdersCount(
  supabase: SupabaseClient,
  wholesalerId: string,
): Promise<number> {
  console.log("🔔 [notifications-query] 읽지 않은 주문 개수 조회 시작", {
    wholesalerId,
  });

  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("wholesaler_id", wholesalerId)
    .is("wholesaler_read_at", null);

  if (error) {
    console.error("❌ [notifications-query] 읽지 않은 주문 개수 조회 오류:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      error: error,
    });
    throw new Error(
      `읽지 않은 주문 개수 조회 실패: ${error.message || "알 수 없는 오류"}`,
    );
  }

  console.log("✅ [notifications-query] 읽지 않은 주문 개수:", count ?? 0);
  return count ?? 0;
}

/**
 * 현재 도매점의 최근 주문 목록 조회 (알림용)
 *
 * 최근 5개의 주문을 조회하며, 읽음 여부를 포함합니다.
 * products, product_variants와 조인하여 상품 정보를 포함합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param wholesalerId 도매점 ID
 * @param limit 조회할 주문 개수 (기본값: 5)
 * @returns 최근 주문 목록 (읽음 여부 포함)
 */
export async function getRecentOrderNotifications(
  supabase: SupabaseClient,
  wholesalerId: string,
  limit: number = 5,
): Promise<OrderNotification[]> {
  console.log("🔔 [notifications-query] 최근 주문 알림 조회 시작", {
    wholesalerId,
    limit,
  });

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      products(*),
      product_variants(*)
    `,
    )
    .eq("wholesaler_id", wholesalerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("❌ [notifications-query] 최근 주문 알림 조회 오류:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      error: error,
    });
    throw new Error(
      `최근 주문 알림 조회 실패: ${error.message || "알 수 없는 오류"}`,
    );
  }

  // 타입 변환 및 is_read 필드 추가
  const notifications: OrderNotification[] = (data || []).map((order: any) => {
    // products와 product_variants는 조인 결과로 단일 객체 또는 null
    const product = Array.isArray(order.products)
      ? order.products[0]
      : order.products;
    const variant = Array.isArray(order.product_variants)
      ? order.product_variants[0] ?? null
      : order.product_variants ?? null;

    return {
      ...order,
      product,
      variant,
      is_read: order.wholesaler_read_at !== null,
    };
  });

  console.log(
    "✅ [notifications-query] 최근 주문 알림 조회 완료:",
    notifications.length,
  );
  return notifications;
}

/**
 * 현재 도매점의 모든 읽지 않은 주문을 읽음 처리
 *
 * 드롭다운 메뉴를 열 때 호출하여 일괄 읽음 처리합니다.
 * wholesaler_read_at이 NULL인 모든 주문의 wholesaler_read_at을 현재 시간으로 업데이트합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param wholesalerId 도매점 ID
 * @returns 업데이트된 주문 개수
 */
export async function markAllOrdersAsRead(
  supabase: SupabaseClient,
  wholesalerId: string,
): Promise<number> {
  console.log("🔔 [notifications-query] 모든 주문 읽음 처리 시작", {
    wholesalerId,
  });

  const { data, error } = await supabase
    .from("orders")
    .update({ wholesaler_read_at: new Date().toISOString() })
    .eq("wholesaler_id", wholesalerId)
    .is("wholesaler_read_at", null)
    .select("id");

  if (error) {
    console.error("❌ [notifications-query] 주문 읽음 처리 오류:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      error: error,
    });
    throw new Error(
      `주문 읽음 처리 실패: ${error.message || "알 수 없는 오류"}`,
    );
  }

  const updatedCount = data?.length ?? 0;
  console.log("✅ [notifications-query] 주문 읽음 처리 완료:", updatedCount);
  return updatedCount;
}

/**
 * 최근 문의 알림 타입
 */
export interface InquiryNotification {
  id: string;
  title: string;
  content: string;
  status: string;
  inquiry_type: string | null;
  created_at: string;
  user_anonymous_code?: string | null; // 문의자 익명 코드
}

/**
 * 현재 도매점의 읽지 않은 문의 개수 조회
 *
 * inquiry_type이 'retailer_to_wholesaler'이고 status가 'open'인 문의만 카운트합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param wholesalerId 도매점 ID
 * @returns 읽지 않은 문의 개수 (status = 'open')
 */
export async function getUnreadInquiriesCount(
  supabase: SupabaseClient,
  wholesalerId: string,
): Promise<number> {
  console.log("🔔 [notifications-query] 읽지 않은 문의 개수 조회 시작", {
    wholesalerId,
  });

  const { count, error } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("wholesaler_id", wholesalerId)
    .eq("inquiry_type", "retailer_to_wholesaler")
    .eq("status", "open");

  if (error) {
    console.error("❌ [notifications-query] 읽지 않은 문의 개수 조회 오류:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      error: error,
    });
    throw new Error(
      `읽지 않은 문의 개수 조회 실패: ${error.message || "알 수 없는 오류"}`,
    );
  }

  console.log("✅ [notifications-query] 읽지 않은 문의 개수:", count ?? 0);
  return count ?? 0;
}

/**
 * 현재 도매점의 최근 문의 목록 조회 (알림용)
 *
 * 최근 5개의 문의를 조회하며, inquiry_type이 'retailer_to_wholesaler'인 문의만 조회합니다.
 * 답변완료(status = 'answered')된 문의는 알림에서 제외됩니다.
 * 문의자 익명 코드를 포함합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param wholesalerId 도매점 ID
 * @param limit 조회할 문의 개수 (기본값: 5)
 * @returns 최근 문의 목록 (답변완료 제외)
 */
export async function getRecentInquiryNotifications(
  supabase: SupabaseClient,
  wholesalerId: string,
  limit: number = 5,
): Promise<InquiryNotification[]> {
  console.log("🔔 [notifications-query] 최근 문의 알림 조회 시작", {
    wholesalerId,
    limit,
  });

  // 1. 문의 목록 조회 (답변완료 제외)
  const { data: inquiries, error } = await supabase
    .from("inquiries")
    .select("id, title, content, status, inquiry_type, created_at, user_id")
    .eq("wholesaler_id", wholesalerId)
    .eq("inquiry_type", "retailer_to_wholesaler")
    .neq("status", "answered") // 답변완료된 문의는 알림에서 제외
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("❌ [notifications-query] 최근 문의 알림 조회 오류:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      error: error,
    });
    throw new Error(
      `최근 문의 알림 조회 실패: ${error.message || "알 수 없는 오류"}`,
    );
  }

  if (!inquiries || inquiries.length === 0) {
    console.log("✅ [notifications-query] 최근 문의 알림 조회 완료: 0개");
    return [];
  }

  // 2. 각 문의에 대해 익명 코드 조회 (기존 getInquiries 패턴 사용)
  const notifications: InquiryNotification[] = await Promise.all(
    inquiries.map(async (inquiry) => {
      // 문의자 프로필 조회
      const { data: inquiryProfile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", inquiry.user_id)
        .single();

      let anonymousCode: string | null = null;

      // 소매점인 경우 anonymous_code 조회
      if (inquiryProfile?.role === "retailer") {
        const { data: retailer } = await supabase
          .from("retailers")
          .select("anonymous_code")
          .eq("profile_id", inquiryProfile.id)
          .single();

        anonymousCode = retailer?.anonymous_code || null;
      }

      return {
        id: inquiry.id,
        title: inquiry.title,
        content: inquiry.content,
        status: inquiry.status,
        inquiry_type: inquiry.inquiry_type,
        created_at: inquiry.created_at,
        user_anonymous_code: anonymousCode,
      };
    }),
  );

  console.log(
    "✅ [notifications-query] 최근 문의 알림 조회 완료:",
    notifications.length,
  );
  return notifications;
}
