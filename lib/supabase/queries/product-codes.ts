"server-only";

/**
 * @file lib/supabase/queries/product-codes.ts
 * @description 코드표 데이터베이스 조회 함수
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { ProductCode } from "@/lib/api/product-codes";

/**
 * Supabase에서 모든 코드표 데이터 조회
 * @returns ProductCode 배열
 */
export async function getAllProductCodes(): Promise<ProductCode[]> {
  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("product_codes")
    .select("*")
    .order("product_no", { ascending: true });

  if (error) {
    console.error("❌ [코드표 조회] 오류:", error);
    throw new Error(`코드표 조회 실패: ${error.message}`);
  }

  return (data || []).map((row) => ({
    productNo: row.product_no,
    대분류명: row.대분류명,
    대분류코드: row.대분류코드,
    중분류명: row.중분류명,
    중분류코드: row.중분류코드,
    소분류명: row.소분류명,
    소분류코드: row.소분류코드,
    품목명: row.품목명,
    품목코드: row.품목코드,
    단위명: row.단위명,
    단위코드: row.단위코드,
    표시단위: row.표시단위,
  }));
}

/**
 * 품목명으로 코드표 검색
 * @param keyword - 검색 키워드
 * @param limit - 최대 결과 수
 * @returns ProductCode 배열
 */
export async function searchProductCodes(
  keyword: string,
  limit: number = 10,
): Promise<ProductCode[]> {
  if (!keyword || keyword.length < 2) return [];

  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("product_codes")
    .select("*")
    .or(
      `품목명.ilike.%${keyword}%,대분류명.ilike.%${keyword}%,소분류명.ilike.%${keyword}%`,
    )
    .limit(limit)
    .order("품목명", { ascending: true });

  if (error) {
    console.error("❌ [코드표 검색] 오류:", error);
    return [];
  }

  return (data || []).map((row) => ({
    productNo: row.product_no,
    대분류명: row.대분류명,
    대분류코드: row.대분류코드,
    중분류명: row.중분류명,
    중분류코드: row.중분류코드,
    소분류명: row.소분류명,
    소분류코드: row.소분류코드,
    품목명: row.품목명,
    품목코드: row.품목코드,
    단위명: row.단위명,
    단위코드: row.단위코드,
    표시단위: row.표시단위,
  }));
}

/**
 * 품목번호로 코드 찾기
 * @param productNo - 품목번호
 * @returns ProductCode 또는 null
 */
export async function getProductCodeByNo(
  productNo: number,
): Promise<ProductCode | null> {
  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("product_codes")
    .select("*")
    .eq("product_no", productNo)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    productNo: data.product_no,
    대분류명: data.대분류명,
    대분류코드: data.대분류코드,
    중분류명: data.중분류명,
    중분류코드: data.중분류코드,
    소분류명: data.소분류명,
    소분류코드: data.소분류코드,
    품목명: data.품목명,
    품목코드: data.품목코드,
    단위명: data.단위명,
    단위코드: data.단위코드,
    표시단위: data.표시단위,
  };
}
