/**
 * @file lib/supabase/queries/inquiries.ts
 * @description 문의 조회 및 답변 쿼리 함수
 *
 * 문의 데이터를 조회하고 답변을 작성하는 Supabase 쿼리 함수들을 제공합니다.
 * 도매점은 자신에게 온 문의만 조회할 수 있습니다.
 *
 * @dependencies
 * - lib/supabase/server.ts
 * - lib/clerk/auth.ts
 * - types/inquiry.ts
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/clerk/auth";
import type {
  Inquiry,
  InquiryDetail,
  InquiryFilter,
  ReplyInquiryRequest,
} from "@/types/inquiry";
import type { InquiryStatus, InquiryType } from "@/types/database";

/**
 * 문의 목록 조회 옵션
 */
export interface GetInquiriesOptions {
  page?: number;
  pageSize?: number;
  sortBy?: "created_at" | "replied_at";
  sortOrder?: "asc" | "desc";
  filter?: InquiryFilter;
}

/**
 * 문의 목록 조회 결과
 */
export interface GetInquiriesResult {
  inquiries: InquiryDetail[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 문의 목록 조회
 * 현재 도매점 관련 문의만 조회합니다.
 */
export async function getInquiries(
  options: GetInquiriesOptions = {},
): Promise<GetInquiriesResult> {
  const {
    page = 1,
    pageSize = 20,
    sortBy = "created_at",
    sortOrder = "desc",
    filter = {},
  } = options;

  console.group("🔍 [inquiries] 문의 목록 조회 시작");
  console.log("옵션:", { page, pageSize, sortBy, sortOrder, filter });

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매점 ID 가져오기
  console.log("🔍 [inquiries] 사용자 프로필 조회 시작");
  const profile = await getUserProfile();

  if (!profile) {
    console.error(
      "❌ [inquiries] 프로필 없음 - 인증되지 않았거나 프로필이 생성되지 않음",
    );
    throw new Error(
      "사용자 프로필을 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
    );
  }

  if (profile.role !== "wholesaler") {
    console.error("❌ [inquiries] 도매점 권한 없음", { role: profile.role });
    throw new Error("도매점 권한이 필요합니다.");
  }

  // 도매점 정보 조회
  const supabase = createClerkSupabaseClient();
  const { data: wholesaler, error: wholesalerError } = await supabase
    .from("wholesalers")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (wholesalerError || !wholesaler) {
    console.error("❌ [inquiries] 도매점 정보 조회 오류:", wholesalerError);
    throw new Error("도매점 정보를 찾을 수 없습니다.");
  }

  console.log("✅ [inquiries] 도매점 ID 확인:", wholesaler.id);

  // 쿼리 빌더 시작
  let query = supabase
    .from("inquiries")
    .select(
      `
      *,
      orders!order_id (
        order_number,
        created_at
      )
    `,
      { count: "exact" },
    )
    .eq("inquiry_type", "retailer_to_wholesaler")
    .eq("wholesaler_id", wholesaler.id);

  // 필터 적용
  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  if (filter.start_date) {
    query = query.gte("created_at", filter.start_date);
  }

  if (filter.end_date) {
    query = query.lte("created_at", filter.end_date);
  }

  if (filter.search) {
    query = query.or(
      `title.ilike.%${filter.search}%,content.ilike.%${filter.search}%`,
    );
  }

  // 정렬
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // 페이지네이션
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  console.log("🔍 [inquiries] Supabase 쿼리 실행");
  const { data, error, count } = await query;

  if (error) {
    console.error("❌ [inquiries] 쿼리 실행 오류:", error);
    throw new Error(
      `문의 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`,
    );
  }

  console.log("✅ [inquiries] 쿼리 실행 완료", {
    count: data?.length || 0,
    total: count || 0,
  });

  // 문의자 익명 코드 조회
  const inquiriesWithAnonymousCode: InquiryDetail[] = await Promise.all(
    (data || []).map(async (inquiry) => {
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
        ...inquiry,
        user_anonymous_code: anonymousCode,
        order: inquiry.orders
          ? {
              order_number: inquiry.orders.order_number,
              created_at: inquiry.orders.created_at,
            }
          : null,
      } as InquiryDetail;
    }),
  );

  const totalPages = Math.ceil((count || 0) / pageSize);

  console.log("✅ [inquiries] 문의 목록 조회 완료", {
    total: count || 0,
    page,
    totalPages,
  });
  console.groupEnd();

  return {
    inquiries: inquiriesWithAnonymousCode,
    total: count || 0,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * 도매사업자 → 관리자 문의 목록 조회
 * 현재 도매사업자가 관리자에게 보낸 문의만 조회합니다.
 */
export async function getInquiriesToAdmin(
  options: GetInquiriesOptions = {},
): Promise<GetInquiriesResult> {
  const {
    page = 1,
    pageSize = 20,
    sortBy = "created_at",
    sortOrder = "desc",
    filter = {},
  } = options;

  console.group("🔍 [inquiries] 관리자 문의 목록 조회 시작");
  console.log("옵션:", { page, pageSize, sortBy, sortOrder, filter });

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매사업자 프로필 조회
  console.log("🔍 [inquiries] 사용자 프로필 조회 시작");
  const profile = await getUserProfile();

  if (!profile) {
    console.error(
      "❌ [inquiries] 프로필 없음 - 인증되지 않았거나 프로필이 생성되지 않음",
    );
    throw new Error(
      "사용자 프로필을 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
    );
  }

  if (profile.role !== "wholesaler") {
    console.error("❌ [inquiries] 도매사업자 권한 없음", {
      role: profile.role,
    });
    throw new Error("도매사업자 권한이 필요합니다.");
  }

  console.log("✅ [inquiries] 도매사업자 프로필 확인:", profile.id);

  const supabase = createClerkSupabaseClient();

  // 쿼리 빌더 시작 (도매→관리자 문의만)
  let query = supabase
    .from("inquiries")
    .select("*", { count: "exact" })
    .eq("inquiry_type", "wholesaler_to_admin")
    .eq("user_id", profile.id); // 자신이 작성한 문의만

  // 필터 적용
  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  if (filter.start_date) {
    query = query.gte("created_at", filter.start_date);
  }

  if (filter.end_date) {
    query = query.lte("created_at", filter.end_date);
  }

  if (filter.search) {
    query = query.or(
      `title.ilike.%${filter.search}%,content.ilike.%${filter.search}%`,
    );
  }

  // 정렬
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // 페이지네이션
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  console.log("🔍 [inquiries] Supabase 쿼리 실행");
  const { data, error, count } = await query;

  if (error) {
    console.error("❌ [inquiries] 쿼리 실행 오류:", error);
    throw new Error(
      `문의 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`,
    );
  }

  console.log("✅ [inquiries] 쿼리 실행 완료", {
    count: data?.length || 0,
    total: count || 0,
  });

  // InquiryDetail 타입으로 변환 (order는 없음)
  const inquiriesWithDetails: InquiryDetail[] = (data || []).map((inquiry) => ({
    ...inquiry,
    user_anonymous_code: null, // 도매→관리자 문의는 익명 코드 불필요
    order: null, // 주문 연결 없음
  }));

  const totalPages = Math.ceil((count || 0) / pageSize);

  console.log("✅ [inquiries] 관리자 문의 목록 조회 완료", {
    total: count || 0,
    page,
    totalPages,
  });
  console.groupEnd();

  return {
    inquiries: inquiriesWithDetails,
    total: count || 0,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * 관리자용: 모든 도매→관리자 문의 목록 조회
 * 관리자가 모든 도매사업자로부터 받은 문의를 조회합니다.
 */
export async function getInquiriesForAdmin(
  options: GetInquiriesOptions = {},
): Promise<GetInquiriesResult> {
  const {
    page = 1,
    pageSize = 20,
    sortBy = "created_at",
    sortOrder = "desc",
    filter = {},
  } = options;

  console.group("🔍 [inquiries] 관리자용 문의 목록 조회 시작");
  console.log("옵션:", { page, pageSize, sortBy, sortOrder, filter });

  // 관리자 권한 확인
  const profile = await getUserProfile();

  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  if (profile.role !== "admin") {
    console.error("❌ [inquiries] 관리자 권한 없음", { role: profile.role });
    throw new Error("관리자 권한이 필요합니다.");
  }

  console.log("✅ [inquiries] 관리자 권한 확인:", profile.id);

  const supabase = createClerkSupabaseClient();

  // 쿼리 빌더 시작 (모든 도매→관리자 문의)
  let query = supabase
    .from("inquiries")
    .select(
      `
      *,
      profiles!user_id (
        id,
        role,
        wholesalers (
          id,
          business_name,
          anonymous_code
        )
      )
    `,
      { count: "exact" },
    )
    .eq("inquiry_type", "wholesaler_to_admin");

  // 필터 적용
  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  if (filter.start_date) {
    query = query.gte("created_at", filter.start_date);
  }

  if (filter.end_date) {
    query = query.lte("created_at", filter.end_date);
  }

  if (filter.search) {
    query = query.or(
      `title.ilike.%${filter.search}%,content.ilike.%${filter.search}%`,
    );
  }

  // 정렬
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // 페이지네이션
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  console.log("🔍 [inquiries] Supabase 쿼리 실행");
  const { data, error, count } = await query;

  if (error) {
    console.error("❌ [inquiries] 쿼리 실행 오류:", error);
    throw new Error(
      `문의 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`,
    );
  }

  console.log("✅ [inquiries] 쿼리 실행 완료", {
    count: data?.length || 0,
    total: count || 0,
  });

  // InquiryDetail 타입으로 변환
  const inquiriesWithDetails: InquiryDetail[] = (data || []).map(
    (inquiry: any) => {
      // 도매사업자 익명 코드 추출
      const wholesaler = inquiry.profiles?.wholesalers?.[0];
      const anonymousCode = wholesaler?.anonymous_code || null;

      return {
        ...inquiry,
        user_anonymous_code: anonymousCode, // 도매사업자 익명 코드
        order: null, // 주문 연결 없음
      };
    },
  );

  const totalPages = Math.ceil((count || 0) / pageSize);

  console.log("✅ [inquiries] 관리자용 문의 목록 조회 완료", {
    total: count || 0,
    page,
    totalPages,
  });
  console.groupEnd();

  return {
    inquiries: inquiriesWithDetails,
    total: count || 0,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * 문의 상세 조회
 * 문의 ID로 상세 정보를 조회합니다.
 * 소매→도매 문의와 도매→관리자 문의 모두 조회 가능합니다.
 */
export async function getInquiryById(
  inquiryId: string,
): Promise<InquiryDetail | null> {
  console.group("🔍 [inquiries] 문의 상세 조회 시작");
  console.log("문의 ID:", inquiryId);

  // ⚠️ RLS 비활성화 환경 대응: 현재 사용자 프로필 조회
  const profile = await getUserProfile();

  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 먼저 문의 조회 (inquiry_type 확인)
  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .select(
      `
      *,
      orders!order_id (
        order_number,
        created_at
      )
    `,
    )
    .eq("id", inquiryId)
    .single();

  if (error) {
    console.error("❌ [inquiries] 문의 조회 오류:", error);
    if (error.code === "PGRST116") {
      console.log("⚠️ [inquiries] 문의를 찾을 수 없음");
      return null;
    }
    throw new Error(`문의를 불러오는 중 오류가 발생했습니다: ${error.message}`);
  }

  if (!inquiry) {
    console.log("⚠️ [inquiries] 문의를 찾을 수 없음");
    return null;
  }

  // 권한 확인: 문의 유형에 따라 다르게 처리
  if (inquiry.inquiry_type === "retailer_to_wholesaler") {
    // 소매→도매 문의: 도매점 권한 필요
    if (profile.role !== "wholesaler") {
      console.error("❌ [inquiries] 도매점 권한 없음");
      throw new Error("도매점 권한이 필요합니다.");
    }

    // 도매점 정보 조회
    const { data: wholesaler, error: wholesalerError } = await supabase
      .from("wholesalers")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (wholesalerError || !wholesaler) {
      console.error("❌ [inquiries] 도매점 정보 조회 오류:", wholesalerError);
      throw new Error("도매점 정보를 찾을 수 없습니다.");
    }

    // 자신의 도매점 문의인지 확인
    if (inquiry.wholesaler_id !== wholesaler.id) {
      console.error("❌ [inquiries] 권한 없음 - 다른 도매점의 문의");
      throw new Error("이 문의를 조회할 권한이 없습니다.");
    }

    // 문의자 익명 코드 조회
    const { data: inquiryProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", inquiry.user_id)
      .single();

    let anonymousCode: string | null = null;

    if (inquiryProfile?.role === "retailer") {
      const { data: retailer } = await supabase
        .from("retailers")
        .select("anonymous_code")
        .eq("profile_id", inquiryProfile.id)
        .single();

      anonymousCode = retailer?.anonymous_code || null;
    }

    const inquiryDetail: InquiryDetail = {
      ...inquiry,
      user_anonymous_code: anonymousCode,
      order: inquiry.orders
        ? {
            order_number: inquiry.orders.order_number,
            created_at: inquiry.orders.created_at,
          }
        : null,
    };

    console.log("✅ [inquiries] 문의 상세 조회 완료 (소매→도매)");
    console.groupEnd();

    return inquiryDetail;
  } else if (inquiry.inquiry_type === "wholesaler_to_admin") {
    // 도매→관리자 문의: 도매사업자 또는 관리자 권한 필요
    if (profile.role !== "wholesaler" && profile.role !== "admin") {
      console.error("❌ [inquiries] 권한 없음", { role: profile.role });
      throw new Error("권한이 필요합니다.");
    }

    // 도매사업자인 경우 자신이 작성한 문의만 조회 가능
    if (profile.role === "wholesaler" && inquiry.user_id !== profile.id) {
      console.error("❌ [inquiries] 권한 없음 - 다른 도매사업자의 문의");
      throw new Error("이 문의를 조회할 권한이 없습니다.");
    }

    // 관리자 문의는 익명 코드 불필요
    const inquiryDetail: InquiryDetail = {
      ...inquiry,
      user_anonymous_code: null,
      order: null,
    };

    console.log("✅ [inquiries] 문의 상세 조회 완료 (도매→관리자)");
    console.groupEnd();

    return inquiryDetail;
  } else {
    console.error("❌ [inquiries] 알 수 없는 문의 유형:", inquiry.inquiry_type);
    throw new Error("알 수 없는 문의 유형입니다.");
  }

  if (error) {
    console.error("❌ [inquiries] 문의 조회 오류:", error);
    if (error.code === "PGRST116") {
      console.log("⚠️ [inquiries] 문의를 찾을 수 없음");
      return null;
    }
    throw new Error(`문의를 불러오는 중 오류가 발생했습니다: ${error.message}`);
  }

  // 문의자 익명 코드 조회
  const { data: inquiryProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", inquiry.user_id)
    .single();

  let anonymousCode: string | null = null;

  if (inquiryProfile?.role === "retailer") {
    const { data: retailer } = await supabase
      .from("retailers")
      .select("anonymous_code")
      .eq("profile_id", inquiryProfile.id)
      .single();

    anonymousCode = retailer?.anonymous_code || null;
  }

  const inquiryDetail: InquiryDetail = {
    ...inquiry,
    user_anonymous_code: anonymousCode,
    order: inquiry.orders
      ? {
          order_number: inquiry.orders.order_number,
          created_at: inquiry.orders.created_at,
        }
      : null,
  };

  console.log("✅ [inquiries] 문의 상세 조회 완료");
  console.groupEnd();

  return inquiryDetail;
}

/**
 * 문의 답변 작성
 * 관리자 또는 도매점이 문의에 답변을 작성합니다.
 */
export async function replyToInquiry(
  request: ReplyInquiryRequest,
): Promise<Inquiry> {
  console.group("🔍 [inquiries] 문의 답변 작성 시작");
  console.log("요청:", { inquiryId: request.inquiry_id });

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매점 ID 가져오기
  const profile = await getUserProfile();

  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  if (profile.role !== "wholesaler" && profile.role !== "admin") {
    console.error("❌ [inquiries] 권한 없음", { role: profile.role });
    throw new Error("답변 작성 권한이 없습니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 도매점인 경우 자신의 문의만 답변 가능
  if (profile.role === "wholesaler") {
    const { data: wholesaler, error: wholesalerError } = await supabase
      .from("wholesalers")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (wholesalerError || !wholesaler) {
      console.error("❌ [inquiries] 도매점 정보 조회 오류:", wholesalerError);
      throw new Error("도매점 정보를 찾을 수 없습니다.");
    }

    // 문의가 자신의 도매점 것인지 확인
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .select("wholesaler_id")
      .eq("id", request.inquiry_id)
      .single();

    if (inquiryError || !inquiry) {
      console.error("❌ [inquiries] 문의 조회 오류:", inquiryError);
      throw new Error("문의를 찾을 수 없습니다.");
    }

    if (inquiry.wholesaler_id !== wholesaler.id) {
      console.error("❌ [inquiries] 권한 없음 - 다른 도매점의 문의");
      throw new Error("이 문의에 답변할 권한이 없습니다.");
    }
  }

  // 답변 업데이트
  const { data: updatedInquiry, error: updateError } = await supabase
    .from("inquiries")
    .update({
      admin_reply: request.admin_reply,
      status: "answered" as InquiryStatus,
      replied_at: new Date().toISOString(),
    })
    .eq("id", request.inquiry_id)
    .select()
    .single();

  if (updateError) {
    console.error("❌ [inquiries] 답변 업데이트 오류:", updateError);
    throw new Error(
      `답변을 저장하는 중 오류가 발생했습니다: ${updateError.message}`,
    );
  }

  console.log("✅ [inquiries] 답변 작성 완료");
  console.groupEnd();

  return updatedInquiry;
}

/**
 * 문의 통계 조회 (대시보드용)
 * 현재 도매점의 미답변 문의 수를 조회합니다.
 */
export async function getInquiryStats(): Promise<{
  total: number;
  open: number;
  answered: number;
  closed: number;
}> {
  console.group("🔍 [inquiries] 문의 통계 조회 시작");

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매점 ID 가져오기
  const profile = await getUserProfile();

  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  if (profile.role !== "wholesaler") {
    console.error("❌ [inquiries] 도매점 권한 없음");
    throw new Error("도매점 권한이 필요합니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 도매점 정보 조회
  const { data: wholesaler, error: wholesalerError } = await supabase
    .from("wholesalers")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (wholesalerError || !wholesaler) {
    console.error("❌ [inquiries] 도매점 정보 조회 오류:", wholesalerError);
    throw new Error("도매점 정보를 찾을 수 없습니다.");
  }

  // 전체 문의 수
  const { count: total } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_wholesaler")
    .eq("wholesaler_id", wholesaler.id);

  // 미답변 문의 수
  const { count: open } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_wholesaler")
    .eq("wholesaler_id", wholesaler.id)
    .eq("status", "open");

  // 답변 완료 문의 수
  const { count: answered } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_wholesaler")
    .eq("wholesaler_id", wholesaler.id)
    .eq("status", "answered");

  // 종료 문의 수
  const { count: closed } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_wholesaler")
    .eq("wholesaler_id", wholesaler.id)
    .eq("status", "closed");

  const stats = {
    total: total || 0,
    open: open || 0,
    answered: answered || 0,
    closed: closed || 0,
  };

  console.log("✅ [inquiries] 문의 통계 조회 완료", stats);
  console.groupEnd();

  return stats;
}
