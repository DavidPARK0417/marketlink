"server-only";

/**
 * @file lib/supabase/queries/products.ts
 * @description 상품 조회 쿼리 함수
 *
 * 도매점의 상품을 조회하는 Supabase 쿼리 함수들을 제공합니다.
 * - 도매점(wholesaler): 자신의 상품만 조회
 * - 관리자(admin): 모든 상품 조회 가능
 * RLS 정책을 통해 권한별로 적절한 데이터만 조회됩니다.
 *
 * @dependencies
 * - lib/supabase/server.ts
 * - types/product.ts
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/clerk/auth";
import type { Product, ProductFilter } from "@/types/product";

/**
 * 상품 목록 조회 옵션
 */
export interface GetProductsOptions {
  page?: number; // 페이지 번호 (1부터 시작)
  pageSize?: number; // 페이지당 항목 수
  sortBy?: "created_at" | "price" | "name"; // 정렬 기준
  sortOrder?: "asc" | "desc"; // 정렬 방향
  filter?: ProductFilter; // 필터 옵션
}

/**
 * 상품 목록 조회 결과
 */
export interface GetProductsResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 상품 목록 조회
 *
 * - 도매점(wholesaler): 자신의 상품만 조회
 * - 관리자(admin): 모든 상품 조회
 * RLS 정책을 통해 권한별로 적절한 데이터만 조회됩니다.
 *
 * @param options 조회 옵션
 * @returns 상품 목록 및 페이지네이션 정보
 */
export async function getProducts(
  options: GetProductsOptions = {},
): Promise<GetProductsResult> {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "created_at",
    sortOrder = "desc",
    filter = {},
  } = options;

  console.log("🔍 [products-query] 상품 목록 조회 시작", {
    page,
    pageSize,
    sortBy,
    sortOrder,
    filter,
  });

  // 현재 사용자 프로필 확인
  const profile = await getUserProfile();
  if (!profile || !["wholesaler", "admin"].includes(profile.role)) {
    throw new Error("도매점 또는 관리자 권한이 없습니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 기본 쿼리 생성
  // 관리자는 모든 상품 조회, 도매점은 자신의 상품만 조회
  let query = supabase.from("products").select("*", { count: "exact" });

  // 도매점인 경우 자신의 상품만 조회하도록 필터 추가
  if (profile.role === "wholesaler") {
    const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
    if (!wholesalers || wholesalers.length === 0) {
      throw new Error("도매점 정보를 찾을 수 없습니다.");
    }

    const currentWholesalerId = wholesalers[0].id;
    console.log("✅ [products-query] 현재 도매점 ID:", currentWholesalerId);
    // ⚠️ RLS 비활성화 환경 대응: 명시적으로 wholesaler_id 필터 추가
    query = query.eq("wholesaler_id", currentWholesalerId);
  } else {
    console.log("✅ [products-query] 관리자 권한으로 모든 상품 조회");
  }

  // 필터 적용
  if (filter.category) {
    query = query.eq("category", filter.category);
  }

  if (filter.is_active !== undefined) {
    query = query.eq("is_active", filter.is_active);
  }

  if (filter.search) {
    // Supabase PostgREST의 .or() 메서드는 % 와일드카드를 사용합니다
    // 다른 파일들(inquiries.ts, product-codes.ts)과 동일한 형식 사용
    const searchTerm = filter.search.trim();
    query = query.or(
      `name.ilike.%${searchTerm}%,standardized_name.ilike.%${searchTerm}%`,
    );
    
    console.log("🔍 [products-query] 검색 필터 적용", {
      searchTerm,
      filterQuery: `name.ilike.%${searchTerm}%,standardized_name.ilike.%${searchTerm}%`,
    });
  }

  if (filter.min_price !== undefined) {
    query = query.gte("price", filter.min_price);
  }

  if (filter.max_price !== undefined) {
    query = query.lte("price", filter.max_price);
  }

  // 정렬 적용
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // 페이지네이션 적용
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("❌ [products-query] 상품 목록 조회 오류:", error);
    throw new Error(`상품 목록 조회 실패: ${error.message}`);
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  console.log("✅ [products-query] 상품 목록 조회 완료", {
    count: data?.length ?? 0,
    total,
    page,
    totalPages,
  });

  return {
    products: (data as Product[]) ?? [],
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * 카테고리별 상품 목록 조회
 *
 * @param category 카테고리
 * @param options 조회 옵션
 * @returns 상품 목록 및 페이지네이션 정보
 */
export async function getProductsByCategory(
  category: string,
  options: Omit<GetProductsOptions, "filter"> = {},
): Promise<GetProductsResult> {
  return getProducts({
    ...options,
    filter: { category },
  });
}

/**
 * 상품명 검색
 *
 * @param searchTerm 검색어
 * @param options 조회 옵션
 * @returns 상품 목록 및 페이지네이션 정보
 */
export async function searchProducts(
  searchTerm: string,
  options: Omit<GetProductsOptions, "filter"> = {},
): Promise<GetProductsResult> {
  return getProducts({
    ...options,
    filter: { search: searchTerm },
  });
}

/**
 * 상품 ID로 단일 상품 조회
 *
 * @param productId 상품 ID
 * @returns 상품 정보 또는 null
 */
export async function getProductById(
  productId: string,
): Promise<Product | null> {
  console.log("🔍 [products-query] 상품 조회 시작", { productId });

  // 현재 사용자 프로필 확인
  const profile = await getUserProfile();
  if (!profile || !["wholesaler", "admin"].includes(profile.role)) {
    throw new Error("도매점 또는 관리자 권한이 없습니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 기본 쿼리 생성
  let query = supabase.from("products").select("*").eq("id", productId);

  // 도매점인 경우 자신의 상품만 조회하도록 필터 추가
  if (profile.role === "wholesaler") {
    const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
    if (!wholesalers || wholesalers.length === 0) {
      throw new Error("도매점 정보를 찾을 수 없습니다.");
    }

    const currentWholesalerId = wholesalers[0].id;
    console.log("✅ [products-query] 현재 도매점 ID:", currentWholesalerId);
    // ⚠️ RLS 비활성화 환경 대응: 명시적으로 wholesaler_id 필터 추가
    query = query.eq("wholesaler_id", currentWholesalerId);
  } else {
    console.log("✅ [products-query] 관리자 권한으로 상품 조회");
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") {
      // 상품이 없는 경우
      console.log("⚠️ [products-query] 상품 없음", { productId });
      return null;
    }

    console.error("❌ [products-query] 상품 조회 오류:", error);
    throw new Error(`상품 조회 실패: ${error.message}`);
  }

  console.log("✅ [products-query] 상품 조회 완료", { productId });

  return data as Product;
}

/**
 * 재고 부족 상품 조회
 *
 * 재고가 10개 이하인 상품을 조회합니다.
 *
 * @returns 재고 부족 상품 목록
 */
export async function getLowStockProducts(): Promise<Product[]> {
  console.log("🔍 [products-query] 재고 부족 상품 조회 시작");

  // 현재 사용자 프로필 확인
  const profile = await getUserProfile();
  if (!profile || !["wholesaler", "admin"].includes(profile.role)) {
    throw new Error("도매점 또는 관리자 권한이 없습니다.");
  }

  const supabase = createClerkSupabaseClient();

  // 기본 쿼리 생성
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .lte("stock", 10)
    .order("stock", { ascending: true })
    .limit(10);

  // 도매점인 경우 자신의 상품만 조회하도록 필터 추가
  if (profile.role === "wholesaler") {
    const wholesalers = profile.wholesalers as Array<{ id: string }> | null;
    if (!wholesalers || wholesalers.length === 0) {
      throw new Error("도매점 정보를 찾을 수 없습니다.");
    }

    const currentWholesalerId = wholesalers[0].id;
    console.log("✅ [products-query] 현재 도매점 ID:", currentWholesalerId);
    // ⚠️ RLS 비활성화 환경 대응: 명시적으로 wholesaler_id 필터 추가
    query = query.eq("wholesaler_id", currentWholesalerId);
  } else {
    console.log("✅ [products-query] 관리자 권한으로 모든 재고 부족 상품 조회");
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ [products-query] 재고 부족 상품 조회 오류:", error);
    throw new Error(`재고 부족 상품 조회 실패: ${error.message}`);
  }

  console.log("✅ [products-query] 재고 부족 상품 조회 완료", {
    count: data?.length ?? 0,
  });

  return (data as Product[]) ?? [];
}
