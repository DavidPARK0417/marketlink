/**
 * @file database.ts
 * @description Supabase 데이터베이스 타입 정의
 *
 * 이 파일은 Supabase 데이터베이스의 기본 타입을 정의합니다.
 * 모든 테이블의 기본 구조와 공통 타입을 포함합니다.
 *
 * @dependencies
 * - Supabase PostgreSQL 스키마 (mk_schema.sql)
 */

/**
 * 사용자 역할 타입
 */
export type UserRole = "retailer" | "wholesaler" | "admin";

/**
 * 사용자 상태 타입
 */
export type UserStatus = "active" | "suspended";

/**
 * 도매 상태 타입
 */
export type WholesalerStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

/**
 * 주문 상태 타입
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "completed"
  | "cancelled";

/**
 * 정산 상태 타입
 */
export type SettlementStatus = "pending" | "completed";

/**
 * CS 스레드 상태 타입
 */
export type CsThreadStatus = "open" | "bot_handled" | "escalated" | "closed";

/**
 * CS 메시지 발신자 타입
 */
export type CsMessageSenderType = "user" | "bot" | "admin";

/**
 * 문의 상태 타입
 */
export type InquiryStatus = "open" | "answered" | "closed";

/**
 * 문의 유형 타입
 */
export type InquiryType = "retailer_to_wholesaler" | "wholesaler_to_admin";

/**
 * 배송 방법 타입
 */
export type DeliveryMethod =
  | "courier"
  | "direct"
  | "quick"
  | "freight"
  | "pickup";

/**
 * 프로필 테이블 타입
 * Clerk 인증 정보 및 역할 관리
 */
export interface Profile {
  id: string;
  clerk_user_id: string;
  email: string;
  role: UserRole | null; // 역할 선택 전까지 NULL 허용
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

/**
 * 사용자 상세 프로필 테이블 타입
 */
export interface User {
  id: string;
  profile_id: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 소매 정보 테이블 타입
 */
export interface Retailer {
  id: string;
  user_id: string; // profiles 테이블 참조
  business_name: string;
  address: string;
  phone: string;
  anonymous_code: string; // R-001 형식 (도매점에게 노출되는 익명 코드)
  created_at: string;
}

/**
 * 장바구니 아이템 테이블 타입
 */
export interface CartItem {
  id: string;
  retailer_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

/**
 * AI 상품 제안 테이블 타입
 */
export interface AiProductSuggestion {
  id: string;
  product_id: string;
  wholesaler_id: string;
  original_name: string;
  suggested_name: string;
  suggested_category: string | null;
  suggested_keywords: string[] | null;
  confidence_score: number | null; // 0.0000 ~ 1.0000
  accepted: boolean;
  created_at: string;
}

/**
 * CS 스레드 테이블 타입
 */
export interface CsThread {
  id: string;
  user_id: string; // profiles 테이블 참조
  title: string;
  status: CsThreadStatus;
  created_at: string;
  closed_at: string | null;
  updated_at: string;
}

/**
 * CS 메시지 테이블 타입
 */
export interface CsMessage {
  id: string;
  cs_thread_id: string;
  sender_type: CsMessageSenderType;
  sender_id: string | null; // profiles 테이블 참조 (nullable)
  content: string;
  created_at: string;
}

/**
 * 감사 로그 테이블 타입
 */
export interface AuditLog {
  id: string;
  user_id: string; // profiles 테이블 참조
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null; // JSONB
  ip_address: string | null;
  created_at: string;
}

/**
 * 결제 테이블 타입
 */
export interface Payment {
  id: string;
  order_id: string;
  settlement_id: string;
  method: string;
  amount: number;
  payment_key: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
