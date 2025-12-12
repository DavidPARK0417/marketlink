/**
 * @file lib/supabase/queries/admin-notifications.ts
 * @description 관리자용 알림 관련 쿼리 함수
 *
 * 관리자의 도매 승인 대기, 도매 문의, 소매 문의 알림을 관리하는 Supabase 쿼리 함수들을 제공합니다.
 * 읽지 않은 항목 개수 조회, 최근 항목 목록 조회 등을 포함합니다.
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - types/inquiry.ts
 * - types/wholesaler.ts
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Inquiry } from "@/types/inquiry";

/**
 * 도매 승인 대기 알림 타입
 */
export interface PendingWholesalerNotification {
  id: string;
  business_name: string;
  business_number: string;
  representative: string;
  created_at: string;
  profiles: {
    email: string;
  };
}

/**
 * 문의 알림 타입
 */
export interface InquiryNotification {
  id: string;
  title: string;
  content: string;
  status: string;
  inquiry_type: string | null;
  created_at: string;
  user_anonymous_code?: string | null; // 문의자 익명 코드
  business_name?: string | null; // 도매 문의의 경우 도매점 상호명
}

/**
 * 관리자용 알림 통계 타입
 */
export interface AdminNotificationStats {
  pendingWholesalersCount: number;
  wholesalerInquiriesCount: number;
  retailInquiriesCount: number;
  totalCount: number;
}

/**
 * 관리자용 알림 통계 조회
 *
 * @param supabase Supabase 클라이언트
 * @returns 알림 통계 (도매 승인 대기, 도매 문의, 소매 문의 개수)
 */
export async function getAdminNotificationStats(
  supabase: SupabaseClient,
): Promise<AdminNotificationStats> {
  console.group("🔔 [admin-notifications] 관리자 알림 통계 조회 시작");

  // 1. 도매 승인 대기 개수 조회
  const { count: pendingWholesalersCount, error: pendingError } = await supabase
    .from("wholesalers")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  if (pendingError) {
    console.error(
      "❌ [admin-notifications] 도매 승인 대기 개수 조회 오류:",
      pendingError,
    );
    throw new Error(
      `도매 승인 대기 개수 조회 실패: ${pendingError.message}`,
    );
  }

  // 2. 도매 문의 개수 조회 (status='open')
  const { count: wholesalerInquiriesCount, error: wholesalerInquiriesError } =
    await supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("inquiry_type", "wholesaler_to_admin")
      .eq("status", "open");

  if (wholesalerInquiriesError) {
    console.error(
      "❌ [admin-notifications] 도매 문의 개수 조회 오류:",
      wholesalerInquiriesError,
    );
    throw new Error(
      `도매 문의 개수 조회 실패: ${wholesalerInquiriesError.message}`,
    );
  }

  // 3. 소매 문의 개수 조회 (status='open')
  const { count: retailInquiriesCount, error: retailInquiriesError } =
    await supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("inquiry_type", "retailer_to_admin")
      .eq("status", "open");

  if (retailInquiriesError) {
    console.error(
      "❌ [admin-notifications] 소매 문의 개수 조회 오류:",
      retailInquiriesError,
    );
    throw new Error(
      `소매 문의 개수 조회 실패: ${retailInquiriesError.message}`,
    );
  }

  const stats: AdminNotificationStats = {
    pendingWholesalersCount: pendingWholesalersCount ?? 0,
    wholesalerInquiriesCount: wholesalerInquiriesCount ?? 0,
    retailInquiriesCount: retailInquiriesCount ?? 0,
    totalCount:
      (pendingWholesalersCount ?? 0) +
      (wholesalerInquiriesCount ?? 0) +
      (retailInquiriesCount ?? 0),
  };

  console.log("✅ [admin-notifications] 관리자 알림 통계 조회 완료:", stats);
  console.groupEnd();

  return stats;
}

/**
 * 최근 도매 승인 대기 목록 조회 (알림용)
 *
 * @param supabase Supabase 클라이언트
 * @param limit 조회할 개수 (기본값: 5)
 * @returns 최근 도매 승인 대기 목록
 */
export async function getRecentPendingWholesalers(
  supabase: SupabaseClient,
  limit: number = 5,
): Promise<PendingWholesalerNotification[]> {
  console.log("🔔 [admin-notifications] 최근 도매 승인 대기 목록 조회 시작", {
    limit,
  });

  const { data, error } = await supabase
    .from("wholesalers")
    .select(
      `
      id,
      business_name,
      business_number,
      representative,
      created_at,
      profiles!inner (
        email
      )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(
      "❌ [admin-notifications] 최근 도매 승인 대기 목록 조회 오류:",
      error,
    );
    throw new Error(
      `최근 도매 승인 대기 목록 조회 실패: ${error.message}`,
    );
  }

  const notifications: PendingWholesalerNotification[] = (data || []).map(
    (item: any) => ({
      id: item.id,
      business_name: item.business_name,
      business_number: item.business_number,
      representative: item.representative,
      created_at: item.created_at,
      profiles: Array.isArray(item.profiles)
        ? item.profiles[0]
        : item.profiles,
    }),
  );

  console.log(
    "✅ [admin-notifications] 최근 도매 승인 대기 목록 조회 완료:",
    notifications.length,
  );

  return notifications;
}

/**
 * 최근 도매 문의 목록 조회 (알림용)
 *
 * @param supabase Supabase 클라이언트
 * @param limit 조회할 개수 (기본값: 5)
 * @returns 최근 도매 문의 목록
 */
export async function getRecentWholesalerInquiries(
  supabase: SupabaseClient,
  limit: number = 5,
): Promise<InquiryNotification[]> {
  console.log("🔔 [admin-notifications] 최근 도매 문의 목록 조회 시작", {
    limit,
  });

  // 1. 문의 목록 조회
  const { data: inquiries, error } = await supabase
    .from("inquiries")
    .select(
      `
      id,
      title,
      content,
      status,
      inquiry_type,
      created_at,
      user_id,
      wholesaler_id
    `,
    )
    .eq("inquiry_type", "wholesaler_to_admin")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(
      "❌ [admin-notifications] 최근 도매 문의 목록 조회 오류:",
      error,
    );
    throw new Error(
      `최근 도매 문의 목록 조회 실패: ${error.message}`,
    );
  }

  if (!inquiries || inquiries.length === 0) {
    console.log(
      "✅ [admin-notifications] 최근 도매 문의 목록 조회 완료: 0개",
    );
    return [];
  }

  // 2. 각 문의에 대해 도매점 정보 조회
  const notifications: InquiryNotification[] = await Promise.all(
    inquiries.map(async (inquiry) => {
      let businessName: string | null = null;

      // 도매점 정보 조회
      if (inquiry.wholesaler_id) {
        const { data: wholesaler } = await supabase
          .from("wholesalers")
          .select("business_name")
          .eq("id", inquiry.wholesaler_id)
          .single();

        businessName = wholesaler?.business_name || null;
      }

      return {
        id: inquiry.id,
        title: inquiry.title,
        content: inquiry.content,
        status: inquiry.status,
        inquiry_type: inquiry.inquiry_type,
        created_at: inquiry.created_at,
        business_name: businessName,
      };
    }),
  );

  console.log(
    "✅ [admin-notifications] 최근 도매 문의 목록 조회 완료:",
    notifications.length,
  );

  return notifications;
}

/**
 * 최근 소매 문의 목록 조회 (알림용)
 *
 * @param supabase Supabase 클라이언트
 * @param limit 조회할 개수 (기본값: 5)
 * @returns 최근 소매 문의 목록
 */
export async function getRecentRetailInquiries(
  supabase: SupabaseClient,
  limit: number = 5,
): Promise<InquiryNotification[]> {
  console.log("🔔 [admin-notifications] 최근 소매 문의 목록 조회 시작", {
    limit,
  });

  // 1. 문의 목록 조회
  const { data: inquiries, error } = await supabase
    .from("inquiries")
    .select(
      `
      id,
      title,
      content,
      status,
      inquiry_type,
      created_at,
      user_id
    `,
    )
    .eq("inquiry_type", "retailer_to_admin")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(
      "❌ [admin-notifications] 최근 소매 문의 목록 조회 오류:",
      error,
    );
    throw new Error(
      `최근 소매 문의 목록 조회 실패: ${error.message}`,
    );
  }

  if (!inquiries || inquiries.length === 0) {
    console.log(
      "✅ [admin-notifications] 최근 소매 문의 목록 조회 완료: 0개",
    );
    return [];
  }

  // 2. 각 문의에 대해 익명 코드 조회
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
    "✅ [admin-notifications] 최근 소매 문의 목록 조회 완료:",
    notifications.length,
  );

  return notifications;
}

