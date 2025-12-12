/**
 * @file inquiry.ts
 * @description 문의 타입 정의
 *
 * 이 파일은 문의(inquiries) 관련 타입을 정의합니다.
 * 문의 작성, 조회, 답변 등을 포함합니다.
 *
 * @dependencies
 * - types/database.ts
 */

import type { InquiryStatus, InquiryType } from "./database";

/**
 * 문의 테이블 타입
 * inquiries 테이블과 일치
 */
export interface Inquiry {
  id: string;
  user_id: string; // profiles 테이블 참조
  inquiry_type: InquiryType | null; // 문의 유형
  wholesaler_id: string | null; // 소매→도매 문의의 경우 대상 도매점 ID
  order_id: string | null; // 소매→도매 문의의 경우 관련 주문 ID
  product_id: string | null; // 소매→도매 문의의 경우 관련 상품 ID
  title: string;
  content: string;
  status: InquiryStatus;
  admin_reply: string | null;
  attachment_urls?: string[] | null; // 첨부 이미지 URL 배열 (최대 5개)
  created_at: string;
  replied_at: string | null;
}

/**
 * 문의 생성 요청 타입
 */
export interface CreateInquiryRequest {
  user_id: string;
  inquiry_type: InquiryType;
  wholesaler_id?: string | null; // retailer_to_wholesaler인 경우 필수
  order_id?: string | null; // retailer_to_wholesaler인 경우 선택
  product_id?: string | null; // retailer_to_wholesaler인 경우 선택 (상품 상세페이지에서 작성 시)
  title: string;
  content: string;
  attachment_urls?: string[] | null; // 첨부 이미지 URL 배열 (최대 5개)
}

/**
 * 문의 업데이트 요청 타입 (사용자용)
 */
export interface UpdateInquiryRequest {
  title?: string;
  content?: string;
}

/**
 * 문의 답변 요청 타입 (관리자용)
 */
export interface ReplyInquiryRequest {
  inquiry_id: string;
  admin_reply: string;
}

/**
 * 문의 목록 조회 필터 타입
 */
export interface InquiryFilter {
  wholesaler_id?: string; // 도매점별 필터링
  inquiry_type?: InquiryType; // 문의 유형 필터링
  status?: InquiryStatus;
  start_date?: string; // ISO 8601 형식
  end_date?: string; // ISO 8601 형식
  search?: string; // 제목 또는 내용 검색
}

/**
 * 문의 목록 조회 옵션 타입
 */
export interface GetInquiriesOptions {
  page?: number;
  pageSize?: number;
  sortBy?: "created_at" | "replied_at";
  sortOrder?: "asc" | "desc";
  filter?: InquiryFilter;
}

/**
 * 문의 상세 정보 타입
 * 익명 코드 등 추가 정보 포함
 */
export interface InquiryDetail extends Inquiry {
  // 문의자 익명 코드 (retailers 테이블의 anonymous_code)
  user_anonymous_code?: string | null;
  // 관리자 조회용: 소매 사업자 정보
  retailer_business_name?: string | null;
  retailer_phone?: string | null;
  // 주문 정보 (order_id가 있는 경우)
  order?: {
    order_number: string;
    created_at: string;
  } | null;
  // 상품 정보 (product_id가 있는 경우)
  product?: {
    id: string;
    name: string;
    image_urls?: string[] | null;
  } | null;
}
