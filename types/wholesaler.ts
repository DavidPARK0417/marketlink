/**
 * @file wholesaler.ts
 * @description 도매점 타입 정의
 *
 * 이 파일은 도매점(wholesaler) 관련 타입을 정의합니다.
 * 도매점 정보, 승인 상태, 익명 코드 등을 포함합니다.
 *
 * @dependencies
 * - types/database.ts
 */

import type { WholesalerStatus } from "./database";

/**
 * 도매점 정보 타입
 * wholesalers 테이블과 일치
 */
export interface Wholesaler {
  id: string;
  profile_id: string; // profiles 테이블 참조
  business_name: string;
  business_number: string;
  representative: string; // 대표자명
  phone: string;
  address: string;
  bank_account: string; // 은행명 포함하여 저장
  anonymous_code: string; // VENDOR-001 형식 (소매에게 노출되는 익명 코드)
  anonymous_id: string | null; // Partner #F2B-01 형식의 익명 식별자
  region: string | null; // 시/구 단위의 대략적 지역 정보
  is_dawn_delivery_available: boolean | null; // 새벽 배송 가능 여부
  delivery_time_slots: string[] | null; // 배송 가능 시간대 배열 (예: ["02:00-06:00", "06:00-10:00"])
  status: WholesalerStatus;
  rejection_reason: string | null;
  created_at: string;
  approved_at: string | null;
}

/**
 * 도매점 생성 요청 타입 (회원가입 시 사용)
 */
export interface CreateWholesalerRequest {
  profile_id: string;
  business_name: string;
  business_number: string;
  representative: string;
  phone: string;
  address: string;
  bank_account: string;
}

/**
 * 도매점 업데이트 요청 타입
 */
export interface UpdateWholesalerRequest {
  business_name?: string;
  phone?: string;
  address?: string;
  bank_account?: string;
  is_dawn_delivery_available?: boolean;
  delivery_time_slots?: string[];
}

/**
 * 도매점 승인 요청 타입 (관리자용)
 */
export interface ApproveWholesalerRequest {
  wholesaler_id: string;
  approved: boolean;
  rejection_reason?: string;
}

/**
 * 도매점 상세 정보 타입 (관리자 조회용)
 * 민감 정보 포함
 */
export interface WholesalerDetail extends Wholesaler {
  // 추가 정보가 필요한 경우 여기에 확장
}

/**
 * 도매점 공개 정보 타입 (소매 조회용)
 * 민감 정보 제외
 */
export interface WholesalerPublicInfo {
  id: string;
  anonymous_code: string;
  address: string; // 시/구까지만 노출 가능 (필요시 별도 처리)
  // business_name, phone, business_number 등은 제외
}
