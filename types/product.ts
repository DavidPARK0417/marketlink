/**
 * @file product.ts
 * @description 상품 타입 정의
 *
 * 이 파일은 상품(product) 및 상품 옵션(product_variants) 관련 타입을 정의합니다.
 * AI 표준화 관련 필드도 포함합니다.
 *
 * @dependencies
 * - types/database.ts
 */

import type { DeliveryMethod } from "./database";

/**
 * 상품 테이블 타입
 * products 테이블과 일치
 */
/**
 * 상품 규격 정보 타입
 */
export interface ProductSpecifications {
  weight?: string;
  size?: string;
  origin?: string; // 필수
  production_location?: string; // 필수
  storage?: string;
}

export interface Product {
  id: string;
  wholesaler_id: string;
  name: string;
  category: string;
  specification: string | null; // 예: "1박스 (10kg)"
  description: string | null;
  price: number; // 기본 가격 (옵션 없을 때)
  moq: number; // 최소주문수량 (Minimum Order Quantity)
  shipping_fee: number;
  delivery_method: DeliveryMethod;
  stock_quantity: number;
  images: string[]; // 다중 이미지 (최대 5개)
  image_url: string | null;
  specifications: ProductSpecifications | null; // 규격 정보 (원산지, 생산지 등)
  is_active: boolean;
  // AI 표준화 관련
  standardized_name: string | null; // AI 제안 수락한 표준화 이름
  ai_suggested_category: string | null;
  ai_keywords: string[] | null; // 검색 키워드 배열
  created_at: string;
  updated_at: string;
}

/**
 * 상품 옵션 테이블 타입
 * product_variants 테이블과 일치
 */
export interface ProductVariant {
  id: string;
  product_id: string;
  name: string; // 옵션명 (예: "1kg", "5kg", "10kg")
  price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 상품 생성 요청 타입
 */
export interface CreateProductRequest {
  wholesaler_id: string;
  name: string;
  category: string;
  specification?: string;
  description?: string;
  price: number;
  moq?: number; // 기본값: 1
  shipping_fee?: number; // 기본값: 0
  delivery_method?: DeliveryMethod; // 기본값: "courier"
  stock_quantity?: number; // 기본값: 0
  images?: string[];
  image_url?: string;
  specifications?: ProductSpecifications;
  is_active?: boolean; // 기본값: true
  // AI 표준화 관련 (선택)
  standardized_name?: string;
  ai_suggested_category?: string;
  ai_keywords?: string[];
}

/**
 * 상품 업데이트 요청 타입
 */
export interface UpdateProductRequest {
  name?: string;
  category?: string;
  specification?: string;
  description?: string;
  price?: number;
  moq?: number;
  shipping_fee?: number;
  delivery_method?: DeliveryMethod;
  stock_quantity?: number;
  images?: string[];
  image_url?: string;
  specifications?: ProductSpecifications;
  is_active?: boolean;
  standardized_name?: string;
  ai_suggested_category?: string;
  ai_keywords?: string[];
}

/**
 * 상품 옵션 생성 요청 타입
 */
export interface CreateProductVariantRequest {
  product_id: string;
  name: string;
  price: number;
  stock_quantity?: number; // 기본값: 0
  is_active?: boolean; // 기본값: true
}

/**
 * 상품 옵션 업데이트 요청 타입
 */
export interface UpdateProductVariantRequest {
  name?: string;
  price?: number;
  stock_quantity?: number;
  is_active?: boolean;
}

/**
 * 상품 상세 정보 타입 (옵션 포함)
 */
export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

/**
 * 상품 목록 조회 필터 타입
 */
export interface ProductFilter {
  category?: string;
  search?: string; // 상품명 또는 키워드 검색
  is_active?: boolean;
  wholesaler_id?: string;
  min_price?: number;
  max_price?: number;
}

/**
 * AI 상품명 표준화 요청 타입
 */
export interface StandardizeProductNameRequest {
  original_name: string;
  category?: string;
}

/**
 * AI 상품명 표준화 응답 타입
 */
export interface StandardizeProductNameResponse {
  suggested_name: string;
  suggested_category: string | null;
  suggested_keywords: string[] | null;
  confidence_score: number; // 0.0 ~ 1.0
}
