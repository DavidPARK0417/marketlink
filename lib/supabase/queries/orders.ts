"server-only";

/**
 * @file lib/supabase/queries/orders.ts
 * @description 주문 조회 쿼리 함수
 *
 * 도매점의 주문을 조회하는 Supabase 쿼리 함수들을 제공합니다.
 * RLS 정책을 통해 현재 도매점의 주문만 조회됩니다.
 *
 * ⚠️ 중요: orders 테이블 구조
 * - order_items 테이블 없음
 * - 1개 orders 레코드 = 1개 상품
 * - products, product_variants 조인 필요
 *
 * @dependencies
 * - lib/supabase/server.ts
 * - types/order.ts
 * - types/product.ts
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/clerk/auth";
import type {
  Order,
  OrderDetail,
  OrderFilter,
  OrderStatus,
} from "@/types/order";

/**
 * 주문 목록 조회 옵션
 */
export interface GetOrdersOptions {
  page?: number; // 페이지 번호 (1부터 시작)
  pageSize?: number; // 페이지당 항목 수
  sortBy?: "created_at" | "total_amount"; // 정렬 기준
  sortOrder?: "asc" | "desc"; // 정렬 방향
  filter?: OrderFilter; // 필터 옵션
}

/**
 * 주문 목록 조회 결과
 */
export interface GetOrdersResult {
  orders: OrderDetail[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: {
    all: number;
    pending: number;
    confirmed: number;
    shipped: number;
    completed: number;
    cancelled: number;
    processing: number; // confirmed + shipped
  };
}

/**
 * 주문 통계 정보
 */
export interface OrderStats {
  // 전체 통계
  totalOrders: number;
  totalAmount: number;

  // 상태별 통계
  pendingCount: number;
  confirmedCount: number;
  shippedCount: number;
  completedCount: number;
  cancelledCount: number;

  // 금액별 통계
  pendingAmount: number;
  confirmedAmount: number;
  shippedAmount: number;
  completedAmount: number;

  // 기간별 통계
  todayOrders: number;
  todayAmount: number;
}

/**
 * 현재 도매점의 주문 목록 조회
 *
 * RLS 정책을 통해 현재 로그인한 도매점의 주문만 조회됩니다.
 * products, product_variants와 조인하여 상품 정보를 포함합니다.
 *
 * @param options 조회 옵션
 * @returns 주문 목록 및 페이지네이션 정보
 */
export async function getOrders(
  options: GetOrdersOptions = {},
): Promise<GetOrdersResult> {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "created_at",
    sortOrder = "desc",
    filter = {},
  } = options;

  console.log("🔍 [orders-query] 주문 목록 조회 시작", {
    page,
    pageSize,
    sortBy,
    sortOrder,
    filter,
  });

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매점 ID 가져오기
  console.log("🔍 [orders-query] 사용자 프로필 조회 시작");
  const profile = await getUserProfile();

  console.log("🔍 [orders-query] 프로필 조회 결과:", {
    hasProfile: !!profile,
    role: profile?.role,
    hasWholesalers: !!profile?.wholesalers,
    wholesalersLength: profile?.wholesalers?.length ?? 0,
    wholesalers: profile?.wholesalers,
  });

  if (!profile) {
    console.error(
      "❌ [orders-query] 프로필 없음 - 인증되지 않았거나 프로필이 생성되지 않음",
    );
    throw new Error(
      "사용자 프로필을 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
    );
  }

  if (profile.role !== "wholesaler" && profile.role !== "admin") {
    console.error("❌ [orders-query] 도매점 권한 없음", { role: profile.role });
    throw new Error("도매점 권한이 없습니다.");
  }

  const isAdmin = profile.role === "admin";
  const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
  
  // 관리자가 아닌 경우에만 도매점 정보 필수
  if (!isAdmin && (!wholesalers || wholesalers.length === 0)) {
    console.error("❌ [orders-query] 도매점 정보 없음", {
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
    console.log("✅ [orders-query] 관리자 모드 - 모든 주문 조회");
  } else {
    console.log("✅ [orders-query] 현재 도매점 ID:", currentWholesalerId);
  }

  const supabase = createClerkSupabaseClient();

  // 고객명 검색이 있는 경우, 먼저 retailers 테이블에서 retailer_id 목록 조회
  let retailerIds: string[] | null = null;
  if (filter.customer_name) {
    console.log("🔍 [orders-query] 고객명 검색 시작", {
      customer_name: filter.customer_name,
    });

    const { data: retailersData, error: retailersError } = await supabase
      .from("retailers")
      .select("id")
      .ilike("business_name", `%${filter.customer_name.trim()}%`);

    if (retailersError) {
      console.error("❌ [orders-query] 고객명 검색 오류:", retailersError);
      throw new Error(`고객명 검색 실패: ${retailersError.message}`);
    }

    retailerIds = retailersData?.map((r) => r.id) ?? [];
    console.log("✅ [orders-query] 고객명 검색 결과", {
      count: retailerIds.length,
      retailer_ids: retailerIds,
    });

    // 고객명 검색 결과가 없으면 빈 결과 반환
    if (retailerIds.length === 0) {
      console.log("⚠️ [orders-query] 고객명 검색 결과 없음 - 빈 결과 반환");
      return {
        orders: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        counts: {
          all: 0,
          pending: 0,
          confirmed: 0,
          shipped: 0,
          completed: 0,
          cancelled: 0,
          processing: 0,
        },
      };
    }
  }

  // 기본 쿼리 생성 (products, product_variants 조인)
  // ⚠️ RLS 비활성화 환경 대응: 명시적으로 wholesaler_id 필터 추가
  // ✅ retailers 테이블의 anonymous_code 조회 (도매점에게 노출용)
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      products(*),
      product_variants(*),
      retailers(id, anonymous_code, business_name)
    `,
      { count: "exact" },
    );
  
  // 관리자가 아닌 경우에만 wholesaler_id 필터 적용
  if (!isAdmin && currentWholesalerId) {
    query = query.eq("wholesaler_id", currentWholesalerId);
  }

  // 필터 적용
  if (filter.statuses && filter.statuses.length > 0) {
    // 다중 상태 필터 (처리중 탭 등)
    query = query.in("status", filter.statuses);
    console.log("🔍 [orders-query] 다중 상태 필터 적용", {
      statuses: filter.statuses,
    });
  } else if (filter.status) {
    // 단일 상태 필터
    query = query.eq("status", filter.status);
  }

  if (filter.start_date) {
    query = query.gte("created_at", filter.start_date);
  }

  if (filter.end_date) {
    // 종료일은 하루 끝까지 포함
    const endDate = new Date(filter.end_date);
    endDate.setHours(23, 59, 59, 999);
    query = query.lte("created_at", endDate.toISOString());
  }

  if (filter.order_number) {
    // 주문번호 정확 일치 검색
    query = query.eq("order_number", filter.order_number);
  }

  // 고객명 검색 결과로 retailer_id 필터링
  if (retailerIds && retailerIds.length > 0) {
    query = query.in("retailer_id", retailerIds);
    console.log("🔍 [orders-query] retailer_id 필터 적용", {
      retailer_ids: retailerIds,
    });
  }

  // 정렬 적용
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // 페이지네이션 적용 (pageSize가 매우 큰 값(999999 이상)이면 전체 데이터 조회)
  if (pageSize && pageSize >= 999999) {
    console.log("🔍 [orders-query] 페이지네이션 없음 - 전체 데이터 조회");
    // range를 적용하지 않아 전체 데이터 조회
  } else {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    console.log("🔍 [orders-query] 페이지네이션 적용", { from, to, pageSize });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("❌ [orders-query] 주문 목록 조회 오류:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`주문 목록 조회 실패: ${error.message}`);
  }

  const total = count ?? 0;
  // pageSize가 매우 큰 값이면 전체 데이터이므로 totalPages는 1
  const totalPages =
    pageSize && pageSize >= 999999 ? 1 : Math.ceil(total / pageSize);

  // 각 상태별 카운트 계산 (필터 조건은 유지하되, status 필터는 제외)
  // 날짜 범위나 주문번호 필터는 유지하여 정확한 카운트 계산
  const buildCountsQuery = (status?: OrderStatus) => {
    let query = supabase
      .from("orders")
      .select("status", { count: "exact", head: true });
    
    // 관리자가 아닌 경우에만 wholesaler_id 필터 적용
    if (!isAdmin && currentWholesalerId) {
      query = query.eq("wholesaler_id", currentWholesalerId);
    }

    // status 필터 적용
    if (status) {
      query = query.eq("status", status);
    }

    // status 필터를 제외한 나머지 필터만 적용
    if (filter.start_date) {
      query = query.gte("created_at", filter.start_date);
    }

    if (filter.end_date) {
      const endDate = new Date(filter.end_date);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte("created_at", endDate.toISOString());
    }

    if (filter.order_number) {
      query = query.eq("order_number", filter.order_number);
    }

    // 고객명 검색 결과로 retailer_id 필터링
    if (retailerIds && retailerIds.length > 0) {
      query = query.in("retailer_id", retailerIds);
    }

    return query;
  };

  // 각 상태별로 카운트 조회
  const [
    allResult,
    pendingResult,
    confirmedResult,
    shippedResult,
    completedResult,
    cancelledResult,
  ] = await Promise.all([
    buildCountsQuery(),
    buildCountsQuery("pending"),
    buildCountsQuery("confirmed"),
    buildCountsQuery("shipped"),
    buildCountsQuery("completed"),
    buildCountsQuery("cancelled"),
  ]);

  const counts = {
    all: allResult.count ?? 0,
    pending: pendingResult.count ?? 0,
    confirmed: confirmedResult.count ?? 0,
    shipped: shippedResult.count ?? 0,
    completed: completedResult.count ?? 0,
    cancelled: cancelledResult.count ?? 0,
    processing: (confirmedResult.count ?? 0) + (shippedResult.count ?? 0), // confirmed + shipped
  };

  console.log("✅ [orders-query] 주문 목록 조회 완료", {
    count: data?.length ?? 0,
    total,
    page,
    totalPages,
    counts,
  });

  // 타입 변환 (products, product_variants 조인 결과)
  const orders: OrderDetail[] = (data ?? []).map((order: any) => ({
    ...order,
    product: order.products,
    variant: order.product_variants,
  }));

  return {
    orders,
    total,
    page,
    pageSize,
    totalPages,
    counts,
  };
}

/**
 * 주문 ID로 단일 주문 조회
 *
 * @param orderId 주문 ID
 * @returns 주문 상세 정보 또는 null
 */
export async function getOrderById(
  orderId: string,
): Promise<OrderDetail | null> {
  console.log("🔍 [orders-query] 주문 조회 시작", { orderId });

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매점 ID 확인
  console.log("🔍 [orders-query] 사용자 프로필 조회 시작");
  const profile = await getUserProfile();

  console.log("🔍 [orders-query] 프로필 조회 결과:", {
    hasProfile: !!profile,
    role: profile?.role,
    hasWholesalers: !!profile?.wholesalers,
    wholesalersLength: profile?.wholesalers?.length ?? 0,
    wholesalers: profile?.wholesalers,
  });

  if (!profile) {
    console.error(
      "❌ [orders-query] 프로필 없음 - 인증되지 않았거나 프로필이 생성되지 않음",
    );
    throw new Error(
      "사용자 프로필을 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
    );
  }

  if (profile.role !== "wholesaler" && profile.role !== "admin") {
    console.error("❌ [orders-query] 도매점 권한 없음", { role: profile.role });
    throw new Error("도매점 권한이 없습니다.");
  }

  const isAdmin = profile.role === "admin";
  const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
  
  // 관리자가 아닌 경우에만 도매점 정보 필수
  if (!isAdmin && (!wholesalers || wholesalers.length === 0)) {
    console.error("❌ [orders-query] 도매점 정보 없음", {
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
    console.log("✅ [orders-query] 관리자 모드 - 모든 주문 조회");
  } else {
    console.log("✅ [orders-query] 현재 도매점 ID:", currentWholesalerId);
  }

  const supabase = createClerkSupabaseClient();

  let query = supabase
    .from("orders")
    .select(
      `
      *,
      products(*),
      product_variants(*),
      retailers(id, anonymous_code)
    `,
    )
    .eq("id", orderId);
  
  // 관리자가 아닌 경우에만 wholesaler_id 필터 적용
  if (!isAdmin && currentWholesalerId) {
    query = query.eq("wholesaler_id", currentWholesalerId);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") {
      // 주문이 없는 경우
      console.log("⚠️ [orders-query] 주문 없음", { orderId });
      return null;
    }

    console.error("❌ [orders-query] 주문 조회 오류:", error);
    throw new Error(`주문 조회 실패: ${error.message}`);
  }

  console.log("✅ [orders-query] 주문 조회 완료", { orderId });

  // 타입 변환
  return {
    ...data,
    product: data.products,
    variant: data.product_variants,
    retailers: data.retailers,
  } as OrderDetail & {
    retailers?: { id: string; anonymous_code: string } | null;
  };
}

/**
 * 주문 상태 변경
 *
 * @param orderId 주문 ID
 * @param status 새로운 상태
 * @returns 업데이트된 주문 정보
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  console.log("🔄 [orders-query] 주문 상태 변경 시작", { orderId, status });

  const supabase = createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    console.error("❌ [orders-query] 주문 상태 변경 오류:", error);
    throw new Error(`주문 상태 변경 실패: ${error.message}`);
  }

  console.log("✅ [orders-query] 주문 상태 변경 완료", { orderId, status });

  return data as Order;
}

/**
 * 주문 통계 조회
 *
 * 현재 도매점의 주문 통계를 조회합니다.
 *
 * @param startDate 시작 날짜 (선택)
 * @param endDate 종료 날짜 (선택)
 * @returns 주문 통계 정보
 */
export async function getOrderStats(
  startDate?: string,
  endDate?: string,
): Promise<OrderStats> {
  console.log("📊 [orders-query] 주문 통계 조회 시작", { startDate, endDate });

  // ⚠️ RLS 비활성화 환경 대응: 현재 도매점 ID 확인
  const profile = await getUserProfile();

  if (!profile || profile.role !== "wholesaler") {
    throw new Error("도매점 권한이 없습니다.");
  }

  const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
  if (!wholesalers || wholesalers.length === 0) {
    throw new Error("도매점 정보를 찾을 수 없습니다.");
  }

  const currentWholesalerId = wholesalers[0].id;

  const supabase = createClerkSupabaseClient();

  let query = supabase
    .from("orders")
    .select("status, total_amount, created_at")
    .eq("wholesaler_id", currentWholesalerId);

  // 날짜 필터 적용
  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ [orders-query] 주문 통계 조회 오류:", error);
    throw new Error(`주문 통계 조회 실패: ${error.message}`);
  }

  const orders = (data ?? []) as Order[];

  // 통계 계산
  const stats: OrderStats = {
    totalOrders: orders.length,
    totalAmount: orders.reduce((sum, order) => sum + order.total_amount, 0),
    pendingCount: 0,
    confirmedCount: 0,
    shippedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    pendingAmount: 0,
    confirmedAmount: 0,
    shippedAmount: 0,
    completedAmount: 0,
    todayOrders: 0,
    todayAmount: 0,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  orders.forEach((order) => {
    // 상태별 카운트 및 금액
    switch (order.status) {
      case "pending":
        stats.pendingCount++;
        stats.pendingAmount += order.total_amount;
        break;
      case "confirmed":
        stats.confirmedCount++;
        stats.confirmedAmount += order.total_amount;
        break;
      case "shipped":
        stats.shippedCount++;
        stats.shippedAmount += order.total_amount;
        break;
      case "completed":
        stats.completedCount++;
        stats.completedAmount += order.total_amount;
        break;
      case "cancelled":
        stats.cancelledCount++;
        break;
    }

    // 오늘 주문 확인
    const orderDate = new Date(order.created_at);
    orderDate.setHours(0, 0, 0, 0);
    if (orderDate.getTime() === today.getTime()) {
      stats.todayOrders++;
      stats.todayAmount += order.total_amount;
    }
  });

  console.log("✅ [orders-query] 주문 통계 조회 완료", stats);

  return stats;
}
