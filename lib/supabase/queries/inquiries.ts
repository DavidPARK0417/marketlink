"server-only";

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
import type { InquiryStatus, InquiryMessage } from "@/types/database";

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
 * 관리자용 소매 문의(소매→관리자) 조회 결과 타입
 */
export interface GetRetailerInquiriesForAdminResult extends GetInquiriesResult {
  inquiries: (InquiryDetail & {
    retailer_business_name?: string | null;
    retailer_phone?: string | null;
  })[];
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

  // 관리자 또는 도매점 권한 확인
  if (profile.role !== "wholesaler" && profile.role !== "admin") {
    console.error("❌ [inquiries] 권한 없음", { role: profile.role });
    throw new Error("도매점 또는 관리자 권한이 필요합니다.");
  }

  const supabase = createClerkSupabaseClient();
  let wholesalerId: string | null = null;

  // 도매점인 경우에만 도매점 정보 조회
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

    wholesalerId = wholesaler.id;
    console.log("✅ [inquiries] 도매점 ID 확인:", wholesalerId);
  } else {
    console.log("👑 [inquiries] 관리자 접근 - 모든 도매점 문의 조회");
  }

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
    .eq("inquiry_type", "retailer_to_wholesaler");

  // 도매점인 경우에만 자신의 문의만 필터링, 관리자는 모든 문의 조회
  if (wholesalerId) {
    query = query.eq("wholesaler_id", wholesalerId);
  }

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
      try {
        // 문의자 프로필 조회
        const { data: inquiryProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", inquiry.user_id)
          .maybeSingle();

        if (profileError) {
          console.warn(
            `⚠️ [inquiries] 프로필 조회 오류 (inquiry_id: ${inquiry.id}, user_id: ${inquiry.user_id}):`,
            profileError,
          );
        }

        let anonymousCode: string | null = null;

        // 소매점인 경우 anonymous_code 조회
        if (inquiryProfile?.role === "retailer") {
          try {
            const { data: retailer, error: retailerError } = await supabase
              .from("retailers")
              .select("anonymous_code")
              .eq("profile_id", inquiryProfile.id)
              .maybeSingle();

            if (retailerError) {
              console.warn(
                `⚠️ [inquiries] 소매점 조회 오류 (profile_id: ${inquiryProfile.id}):`,
                retailerError,
              );
            }

            anonymousCode = retailer?.anonymous_code || null;
          } catch (retailerErr) {
            console.warn(
              `⚠️ [inquiries] 소매점 조회 예외 (profile_id: ${inquiryProfile.id}):`,
              retailerErr,
            );
          }
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
      } catch (err) {
        console.error(
          `❌ [inquiries] 문의 처리 오류 (inquiry_id: ${inquiry.id}):`,
          err,
        );
        // 에러가 발생해도 기본 정보는 반환
        return {
          ...inquiry,
          user_anonymous_code: null,
          order: inquiry.orders
            ? {
                order_number: inquiry.orders.order_number,
                created_at: inquiry.orders.created_at,
              }
            : null,
        } as InquiryDetail;
      }
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
 * 관리자용: 모든 소매→관리자 문의 목록 조회
 */
export async function getRetailerInquiriesForAdmin(
  options: GetInquiriesOptions = {},
): Promise<GetRetailerInquiriesForAdminResult> {
  const {
    page = 1,
    pageSize = 20,
    sortBy = "created_at",
    sortOrder = "desc",
    filter = {},
  } = options;

  console.group("🔍 [inquiries] 관리자용 소매→관리자 문의 목록 조회 시작");
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

  // 소매→관리자 문의 + 소매사업자 정보 조인
  let query = supabase
    .from("inquiries")
    .select(
      `
        *,
        profiles!user_id (
          id,
          role,
          retailers (
            business_name,
            phone,
            anonymous_code
          )
        )
      `,
      { count: "exact" },
    )
    .eq("inquiry_type", "retailer_to_admin");

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

  const inquiriesWithDetails = (data || []).map((inquiry: any) => {
    const retailer = inquiry.profiles?.retailers?.[0];

    return {
      ...inquiry,
      user_anonymous_code: retailer?.anonymous_code || null, // anonymous_code가 있다면 표시
      retailer_business_name: retailer?.business_name || null,
      retailer_phone: retailer?.phone || null,
      order: inquiry.orders
        ? {
            order_number: inquiry.orders.order_number,
            created_at: inquiry.orders.created_at,
          }
        : null,
    } as InquiryDetail & {
      retailer_business_name?: string | null;
      retailer_phone?: string | null;
    };
  });

  const totalPages = Math.ceil((count || 0) / pageSize);

  console.log("✅ [inquiries] 관리자용 소매→관리자 문의 목록 조회 완료", {
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
          phone,
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
      // 도매사업자 정보 추출
      const wholesaler = inquiry.profiles?.wholesalers?.[0];
      const anonymousCode = wholesaler?.anonymous_code || null;
      const businessName = wholesaler?.business_name || null;
      const phone = wholesaler?.phone || null;

      console.log("🔍 [inquiries] 도매사업자 정보 추출:", {
        inquiryId: inquiry.id,
        businessName,
        phone,
        anonymousCode,
      });

      return {
        ...inquiry,
        user_anonymous_code: anonymousCode, // 도매사업자 익명 코드
        wholesaler_business_name: businessName, // 도매사업자명 (소매문의와 동일한 구조)
        wholesaler_phone: phone, // 도매사업자 연락처 (소매문의와 동일한 구조)
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
      ),
      products!product_id (
        id,
        name,
        images
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
      product: inquiry.products
        ? {
            id: inquiry.products.id,
            name: inquiry.products.name,
            image_urls: inquiry.products.images || null,
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
  } else if (inquiry.inquiry_type === "retailer_to_admin") {
    // 소매→관리자 문의: 소매 작성자 또는 관리자 권한 필요
    if (profile.role !== "admin" && inquiry.user_id !== profile.id) {
      console.error("❌ [inquiries] 권한 없음 - 소매→관리자 문의");
      throw new Error("이 문의를 조회할 권한이 없습니다.");
    }

    const inquiryDetail: InquiryDetail = {
      ...inquiry,
      user_anonymous_code: null,
      order: null,
    };

    console.log("✅ [inquiries] 문의 상세 조회 완료 (소매→관리자)");
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
  const repliedAt = new Date().toISOString();
  const { data: updatedInquiry, error: updateError } = await supabase
    .from("inquiries")
    .update({
      admin_reply: request.admin_reply,
      status: "answered" as InquiryStatus,
      replied_at: repliedAt,
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

  // inquiry_messages 테이블에 답변 메시지 추가
  // 문의 타입에 따라 sender_type 결정
  const { data: inquiryInfo } = await supabase
    .from("inquiries")
    .select("inquiry_type")
    .eq("id", request.inquiry_id)
    .single();

  const senderType =
    inquiryInfo?.inquiry_type === "retailer_to_wholesaler"
      ? "wholesaler"
      : "admin";

  const { error: messageError } = await supabase
    .from("inquiry_messages")
    .insert({
      inquiry_id: request.inquiry_id,
      sender_type: senderType,
      sender_id: profile.id,
      content: request.admin_reply.trim(),
    });

  if (messageError) {
    console.warn(
      "⚠️ [inquiries] inquiry_messages 저장 실패 (무시):",
      messageError,
    );
    // 메시지 저장 실패는 치명적이지 않으므로 계속 진행
  } else {
    console.log("✅ [inquiries] inquiry_messages 저장 완료");
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

/**
 * 관리자용 상품문의 통계 조회 (소매 → 도매, 전체 합계)
 * 관리자 역할로 접속했을 때 도매 페이지의 상품문의 카드에 보여줄 집계입니다.
 */
export async function getRetailerToWholesalerStatsForAdmin(): Promise<{
  total: number;
  open: number;
  answered: number;
  closed: number;
}> {
  console.group("🔍 [inquiries] 관리자용 소매→도매 문의 통계 조회 시작");

  // 관리자 권한 확인
  const profile = await getUserProfile();

  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  if (profile.role !== "admin") {
    console.error("❌ [inquiries] 관리자 권한 없음");
    throw new Error("관리자 권한이 필요합니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 전체 문의 수 (소매→도매, 전체 합산)
  const { count: total } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_wholesaler");

  // 미답변 문의 수
  const { count: open } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_wholesaler")
    .eq("status", "open");

  // 답변 완료 문의 수
  const { count: answered } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_wholesaler")
    .eq("status", "answered");

  // 종료 문의 수
  const { count: closed } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_wholesaler")
    .eq("status", "closed");

  const stats = {
    total: total || 0,
    open: open || 0,
    answered: answered || 0,
    closed: closed || 0,
  };

  console.log("✅ [inquiries] 관리자용 소매→도매 문의 통계 조회 완료", stats);
  console.groupEnd();

  return stats;
}

/**
 * 관리자용 소매→관리자 문의 통계 조회
 */
export async function getRetailerToAdminStatsForAdmin(): Promise<{
  total: number;
  open: number;
  answered: number;
  closed: number;
}> {
  console.group("🔍 [inquiries] 관리자용 소매→관리자 문의 통계 조회 시작");

  // 관리자 권한 확인
  const profile = await getUserProfile();

  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  if (profile.role !== "admin") {
    console.error("❌ [inquiries] 관리자 권한 없음");
    throw new Error("관리자 권한이 필요합니다.");
  }

  const supabase = createClerkSupabaseClient();

  const { count: total } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_admin");

  const { count: open } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_admin")
    .eq("status", "open");

  const { count: answered } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_admin")
    .eq("status", "answered");

  const { count: closed } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "retailer_to_admin")
    .eq("status", "closed");

  const stats = {
    total: total || 0,
    open: open || 0,
    answered: answered || 0,
    closed: closed || 0,
  };

  console.log("✅ [inquiries] 관리자용 소매→관리자 문의 통계 조회 완료", stats);
  console.groupEnd();

  return stats;
}

/**
 * 관리자용 문의 통계 조회
 * 모든 도매→관리자 문의의 통계를 조회합니다.
 */
export async function getInquiryStatsForAdmin(): Promise<{
  total: number;
  open: number;
  answered: number;
  closed: number;
}> {
  console.group("🔍 [inquiries] 관리자용 문의 통계 조회 시작");

  // 관리자 권한 확인
  const profile = await getUserProfile();

  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  if (profile.role !== "admin") {
    console.error("❌ [inquiries] 관리자 권한 없음");
    throw new Error("관리자 권한이 필요합니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 전체 문의 수 (도매→관리자)
  const { count: total } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "wholesaler_to_admin");

  // 미답변 문의 수
  const { count: open } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "wholesaler_to_admin")
    .eq("status", "open");

  // 답변 완료 문의 수
  const { count: answered } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "wholesaler_to_admin")
    .eq("status", "answered");

  // 종료 문의 수
  const { count: closed } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("inquiry_type", "wholesaler_to_admin")
    .eq("status", "closed");

  const stats = {
    total: total || 0,
    open: open || 0,
    answered: answered || 0,
    closed: closed || 0,
  };

  console.log("✅ [inquiries] 관리자용 문의 통계 조회 완료", stats);
  console.groupEnd();

  return stats;
}

/**
 * 문의 대화 히스토리 조회
 * 
 * @param {string} inquiryId - 문의 ID
 * @returns {Promise<InquiryMessage[]>} 대화 히스토리 메시지 배열
 */
export async function getInquiryMessages(
  inquiryId: string,
): Promise<InquiryMessage[]> {
  console.group("🔍 [inquiries] 문의 대화 히스토리 조회 시작");
  console.log("inquiryId:", inquiryId);

  const supabase = createClerkSupabaseClient();

  // 대화 히스토리 조회 (시간순 정렬)
  const { data: messages, error } = await supabase
    .from("inquiry_messages")
    .select("*")
    .eq("inquiry_id", inquiryId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ [inquiries] 대화 히스토리 조회 오류:", error);
    throw new Error("대화 히스토리를 조회하는 중 오류가 발생했습니다.");
  }

  console.log("✅ [inquiries] 대화 히스토리 조회 완료", {
    messageCount: messages?.length ?? 0,
  });
  console.groupEnd();

  return (messages as InquiryMessage[]) || [];
}

/**
 * 문의 메시지 추가 (추가 질문 또는 답변)
 * 
 * @param {string} inquiryId - 문의 ID
 * @param {string} content - 메시지 내용
 * @param {string} senderType - 발신자 타입 ('user', 'admin', 'wholesaler')
 * @returns {Promise<InquiryMessage>} 생성된 메시지
 */
export async function addInquiryMessage(
  inquiryId: string,
  content: string,
  senderType: "user" | "admin" | "wholesaler" = "user",
): Promise<InquiryMessage> {
  console.group("📝 [inquiries] 문의 메시지 추가 시작");
  console.log("inquiryId:", inquiryId, "senderType:", senderType);

  // 사용자 프로필 조회
  const profile = await getUserProfile();

  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  // 권한 확인
  if (senderType === "user") {
    // 문의자가 추가 질문하는 경우
    // 문의의 user_id와 현재 사용자 ID가 일치해야 함
    const supabase = createClerkSupabaseClient();
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .select("user_id, status")
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      console.error("❌ [inquiries] 문의 조회 오류:", inquiryError);
      throw new Error("문의를 찾을 수 없습니다.");
    }

    if (inquiry.user_id !== profile.id) {
      console.error("❌ [inquiries] 권한 없음 - 다른 사용자의 문의");
      throw new Error("이 문의에 추가 질문할 권한이 없습니다.");
    }

    // 문의 상태를 'open'으로 변경 (추가 질문이 있으면 다시 열림)
    if (inquiry.status === "answered" || inquiry.status === "closed") {
      await supabase
        .from("inquiries")
        .update({ status: "open" as InquiryStatus })
        .eq("id", inquiryId);
    }
  } else if (senderType === "admin" || senderType === "wholesaler") {
    // 관리자 또는 도매사업자가 답변하는 경우
    if (profile.role !== "admin" && profile.role !== "wholesaler") {
      console.error("❌ [inquiries] 권한 없음", { role: profile.role });
      throw new Error("답변 작성 권한이 없습니다.");
    }

    // 답변 작성 시 상태를 'answered'로 변경
    const supabase = createClerkSupabaseClient();
    await supabase
      .from("inquiries")
      .update({
        status: "answered" as InquiryStatus,
        replied_at: new Date().toISOString(),
      })
      .eq("id", inquiryId);
  }

  const supabase = createClerkSupabaseClient();

  // 메시지 추가
  const { data: message, error: messageError } = await supabase
    .from("inquiry_messages")
    .insert({
      inquiry_id: inquiryId,
      sender_type: senderType,
      sender_id: profile.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (messageError) {
    console.error("❌ [inquiries] 메시지 추가 오류:", messageError);
    throw new Error("메시지를 추가하는 중 오류가 발생했습니다.");
  }

  console.log("✅ [inquiries] 메시지 추가 완료:", message.id);
  console.groupEnd();

  return message as InquiryMessage;
}

/**
 * 문의 메시지 수정
 * 자신이 작성한 메시지만 수정 가능하며, 종료된 문의의 메시지는 수정 불가
 * 
 * @param {string} messageId - 수정할 메시지 ID
 * @param {string} newContent - 새로운 내용
 * @returns {Promise<InquiryMessage>} 수정된 메시지
 */
export async function updateInquiryMessage(
  messageId: string,
  newContent: string,
): Promise<InquiryMessage> {
  console.group("✏️ [inquiries] 문의 메시지 수정 시작");
  console.log("messageId:", messageId);

  const profile = await getUserProfile();
  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 1. 메시지 정보 조회
  const { data: message, error: messageError } = await supabase
    .from("inquiry_messages")
    .select("id, inquiry_id, sender_id, sender_type, content")
    .eq("id", messageId)
    .single();

  if (messageError || !message) {
    console.error("❌ [inquiries] 메시지 조회 오류:", messageError);
    throw new Error("메시지를 찾을 수 없습니다.");
  }

  // 2. 권한 확인: 자신이 작성한 메시지만 수정 가능
  if (message.sender_id !== profile.id) {
    console.error("❌ [inquiries] 권한 없음 - 다른 사용자의 메시지");
    throw new Error("본인이 작성한 메시지만 수정할 수 있습니다.");
  }

  // 3. 문의 상태 확인: 종료된 문의는 수정 불가
  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("status")
    .eq("id", message.inquiry_id)
    .single();

  if (inquiryError || !inquiry) {
    console.error("❌ [inquiries] 문의 조회 오류:", inquiryError);
    throw new Error("문의를 찾을 수 없습니다.");
  }

  if (inquiry.status === "closed") {
    console.error("❌ [inquiries] 종료된 문의의 메시지는 수정 불가");
    throw new Error("종료된 문의의 메시지는 수정할 수 없습니다.");
  }

  // 4. 내용 검증
  const trimmedContent = newContent.trim();
  if (trimmedContent.length < 10) {
    throw new Error("내용은 최소 10자 이상 입력해주세요.");
  }
  if (trimmedContent.length > 5000) {
    throw new Error("내용은 최대 5000자까지 입력할 수 있습니다.");
  }

  // 5. 메시지 업데이트
  const { data: updatedMessage, error: updateError } = await supabase
    .from("inquiry_messages")
    .update({
      content: trimmedContent,
      edited_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .select()
    .single();

  if (updateError) {
    console.error("❌ [inquiries] 메시지 수정 오류:", updateError);
    throw new Error("메시지를 수정하는 중 오류가 발생했습니다.");
  }

  console.log("✅ [inquiries] 메시지 수정 완료");
  console.groupEnd();

  return updatedMessage as InquiryMessage;
}

/**
 * 문의 메시지 삭제
 * 자신이 작성한 메시지만 삭제 가능하며, 종료된 문의의 메시지는 삭제 불가
 * 
 * @param {string} messageId - 삭제할 메시지 ID
 * @returns {Promise<void>}
 */
export async function deleteInquiryMessage(messageId: string): Promise<void> {
  console.group("🗑️ [inquiries] 문의 메시지 삭제 시작");
  console.log("messageId:", messageId);

  const profile = await getUserProfile();
  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 1. 메시지 정보 조회
  const { data: message, error: messageError } = await supabase
    .from("inquiry_messages")
    .select("id, inquiry_id, sender_id, sender_type, content")
    .eq("id", messageId)
    .single();

  if (messageError || !message) {
    console.error("❌ [inquiries] 메시지 조회 오류:", messageError);
    throw new Error("메시지를 찾을 수 없습니다.");
  }

  // 2. 권한 확인: 자신이 작성한 메시지만 삭제 가능
  if (message.sender_id !== profile.id) {
    console.error("❌ [inquiries] 권한 없음 - 다른 사용자의 메시지");
    throw new Error("본인이 작성한 메시지만 삭제할 수 있습니다.");
  }

  // 3. 문의 상태 확인: 종료된 문의는 삭제 불가
  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("status")
    .eq("id", message.inquiry_id)
    .single();

  if (inquiryError || !inquiry) {
    console.error("❌ [inquiries] 문의 조회 오류:", inquiryError);
    throw new Error("문의를 찾을 수 없습니다.");
  }

  if (inquiry.status === "closed") {
    console.error("❌ [inquiries] 종료된 문의의 메시지는 삭제 불가");
    throw new Error("종료된 문의의 메시지는 삭제할 수 없습니다.");
  }

  // 4. 메시지 삭제
  const { error: deleteError } = await supabase
    .from("inquiry_messages")
    .delete()
    .eq("id", messageId);

  if (deleteError) {
    console.error("❌ [inquiries] 메시지 삭제 오류:", deleteError);
    throw new Error("메시지를 삭제하는 중 오류가 발생했습니다.");
  }

  if (!deleteError) {
    const { data: remainingReply, count: remainingReplies, error: countError } =
      await supabase
        .from("inquiry_messages")
        .select("content, created_at", { count: "exact", head: false })
        .eq("inquiry_id", message.inquiry_id)
        .in("sender_type", ["admin", "wholesaler"])
        .order("created_at", { ascending: false })
        .limit(1);

    if (countError) {
      console.warn("⚠️ [inquiries] 남은 답변 수 조회 실패 (무시):", countError);
    } else if (message.sender_type === "admin" || message.sender_type === "wholesaler") {
      if ((remainingReplies ?? 0) === 0) {
        const { error: revertError } = await supabase
          .from("inquiries")
          .update({
            status: "open",
            admin_reply: null,
            replied_at: null,
          })
          .eq("id", message.inquiry_id);

        if (revertError) {
          console.warn("⚠️ [inquiries] 답변 상태 되돌리기 실패 (무시):", revertError);
        } else {
          console.log(
            "ℹ️ [inquiries] 마지막 답변 삭제로 상태를 open 으로 되돌렸습니다.",
          );
        }
      } else if (remainingReply && remainingReply.length > 0) {
        const latest = remainingReply[0];
        const { error: syncError } = await supabase
          .from("inquiries")
          .update({
            status: "answered",
            admin_reply: latest.content,
            replied_at: latest.created_at,
          })
          .eq("id", message.inquiry_id);

        if (syncError) {
          console.warn("⚠️ [inquiries] 답변 본문 동기화 실패 (무시):", syncError);
        } else {
          console.log("ℹ️ [inquiries] 최신 답변으로 admin_reply 동기화 완료");
        }
      }
    }
  }

  console.log("✅ [inquiries] 메시지 삭제 완료");
  console.groupEnd();
}

/**
 * 문의글 전체 삭제
 * 자신이 작성한 문의만 삭제 가능
 * 관련 메시지와 첨부파일도 함께 삭제됨 (CASCADE)
 * 
 * @param {string} inquiryId - 삭제할 문의 ID
 * @returns {Promise<void>}
 */
export async function deleteInquiry(inquiryId: string): Promise<void> {
  console.group("🗑️ [inquiries] 문의글 삭제 시작");
  console.log("inquiryId:", inquiryId);

  const profile = await getUserProfile();
  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 1. 문의 정보 조회
  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("id, user_id, inquiry_type, attachment_urls")
    .eq("id", inquiryId)
    .single();

  if (inquiryError || !inquiry) {
    console.error("❌ [inquiries] 문의 조회 오류:", inquiryError);
    throw new Error("문의를 찾을 수 없습니다.");
  }

  // 2. 권한 확인: 자신이 작성한 문의만 삭제 가능
  if (inquiry.user_id !== profile.id) {
    console.error("❌ [inquiries] 권한 없음 - 다른 사용자의 문의");
    throw new Error("본인이 작성한 문의만 삭제할 수 있습니다.");
  }

  // 3. 도매→관리자 문의만 삭제 가능 (소매→도매 문의는 삭제 불가)
  if (inquiry.inquiry_type !== "wholesaler_to_admin") {
    console.error("❌ [inquiries] 삭제 불가능한 문의 타입:", inquiry.inquiry_type);
    throw new Error("이 문의는 삭제할 수 없습니다.");
  }

  // 4. 첨부파일 삭제 (Storage에서)
  if (inquiry.attachment_urls && Array.isArray(inquiry.attachment_urls) && inquiry.attachment_urls.length > 0) {
    console.log("📎 [inquiries] 첨부파일 삭제 시작:", inquiry.attachment_urls.length, "개");
    
    const storageClient = createClerkSupabaseClient();
    const bucketName = "product-images"; // 문의 첨부파일은 product-images 버킷에 저장됨
    
    for (const url of inquiry.attachment_urls) {
      try {
        // Public URL에서 파일 경로 추출
        // 예: https://xxx.supabase.co/storage/v1/object/public/product-images/user_id/inquiries/file.jpg
        // → user_id/inquiries/file.jpg
        let filePath: string;
        
        if (url.includes("/storage/v1/object/public/")) {
          // Public URL인 경우 경로 추출
          const urlParts = url.split("/storage/v1/object/public/");
          if (urlParts.length < 2) {
            throw new Error("올바른 이미지 URL 형식이 아닙니다.");
          }
          const pathParts = urlParts[1].split("/");
          if (pathParts.length < 2) {
            throw new Error("올바른 이미지 경로가 아닙니다.");
          }
          // 버킷 이름 제거하고 나머지 경로만 사용
          filePath = pathParts.slice(1).join("/");
        } else {
          // 이미 경로인 경우 그대로 사용
          filePath = url;
        }
        
        if (filePath) {
          const { error: deleteFileError } = await storageClient.storage
            .from(bucketName)
            .remove([filePath]);
          
          if (deleteFileError) {
            console.warn("⚠️ [inquiries] 첨부파일 삭제 실패:", filePath, deleteFileError);
            // 첨부파일 삭제 실패해도 문의 삭제는 계속 진행
          } else {
            console.log("✅ [inquiries] 첨부파일 삭제 성공:", filePath);
          }
        }
      } catch (error) {
        console.warn("⚠️ [inquiries] 첨부파일 URL 파싱 실패:", url, error);
        // URL 파싱 실패해도 문의 삭제는 계속 진행
      }
    }
  }

  // 5. 문의 삭제 (CASCADE로 관련 메시지도 자동 삭제됨)
  const { error: deleteError } = await supabase
    .from("inquiries")
    .delete()
    .eq("id", inquiryId);

  if (deleteError) {
    console.error("❌ [inquiries] 문의 삭제 오류:", deleteError);
    throw new Error("문의를 삭제하는 중 오류가 발생했습니다.");
  }

  console.log("✅ [inquiries] 문의글 삭제 완료");
  console.groupEnd();
}

/**
 * 문의 수정 (작성자 전용)
 * - wholesaler_to_admin 문의만 대상
 * - 종료된 문의는 수정 불가
 */
export async function updateInquiryContent(
  inquiryId: string,
  payload: { title: string; content: string },
) {
  console.group("✏️ [inquiries] 문의 수정 시작");
  console.log("inquiryId:", inquiryId);

  const profile = await getUserProfile();
  if (!profile) {
    console.error("❌ [inquiries] 프로필 없음");
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 1. 문의 정보 조회
  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("user_id, inquiry_type, status")
    .eq("id", inquiryId)
    .single();

  if (inquiryError || !inquiry) {
    console.error("❌ [inquiries] 문의 조회 오류:", inquiryError);
    throw new Error("문의를 찾을 수 없습니다.");
  }

  if (inquiry.user_id !== profile.id) {
    console.error("❌ [inquiries] 권한 없음 - 다른 사용자의 문의");
    throw new Error("본인이 작성한 문의만 수정할 수 있습니다.");
  }

  if (inquiry.inquiry_type !== "wholesaler_to_admin") {
    console.error("❌ [inquiries] 수정 불가한 문의 유형:", inquiry.inquiry_type);
    throw new Error("이 문의 유형은 수정할 수 없습니다.");
  }

  if (inquiry.status === "closed") {
    console.error("❌ [inquiries] 종료된 문의 수정 불가");
    throw new Error("종료된 문의는 수정할 수 없습니다.");
  }

  // 2. 업데이트
  const { data: updated, error: updateError } = await supabase
    .from("inquiries")
    .update({
      title: payload.title,
      content: payload.content,
    })
    .eq("id", inquiryId)
    .select()
    .single();

  if (updateError || !updated) {
    console.error("❌ [inquiries] 문의 수정 오류:", updateError);
    throw new Error("문의를 수정하는 중 오류가 발생했습니다.");
  }

  console.log("✅ [inquiries] 문의 수정 완료");
  console.groupEnd();
  return updated as Inquiry;
}