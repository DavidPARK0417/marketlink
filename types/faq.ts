/**
 * @file types/faq.ts
 * @description FAQ 관련 타입 정의
 */

/**
 * FAQ 타입
 */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * FAQ 생성 요청 타입
 */
export interface CreateFAQRequest {
  question: string;
  answer: string;
  display_order?: number;
}

/**
 * FAQ 업데이트 요청 타입
 */
export interface UpdateFAQRequest {
  question?: string;
  answer?: string;
  display_order?: number;
}

/**
 * FAQ 목록 조회 필터 타입
 */
export interface FAQFilter {
  search?: string; // 검색어 (질문/답변 내용 검색)
}

