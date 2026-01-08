/**
 * @file settlement.ts
 * @description 정산 타입 정의
 *
 * 이 파일은 정산(settlements) 관련 타입을 정의합니다.
 * 정산 계산, 정산 조회, 정산 상태 등을 포함합니다.
 *
 * @dependencies
 * - types/database.ts
 * - types/order.ts
 */

import type { SettlementStatus } from "./database";
import type { Order } from "./order";

/**
 * 정산 테이블 타입
 * settlements 테이블과 일치
 */
export interface Settlement {
  id: string;
  order_id: string;
  wholesaler_id: string;
  order_amount: number; // 주문 금액
  platform_fee_rate: number; // 플랫폼 수수료율 (예: 0.05 = 5%)
  platform_fee: number; // order_amount * platform_fee_rate
  wholesaler_amount: number; // order_amount - platform_fee
  status: SettlementStatus;
  scheduled_payout_at: string | null; // 정산 예정일 (배송완료일 + 7일). 배송완료 전에는 null
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 정산 생성 요청 타입
 * 주문 생성 시 자동으로 정산 계산
 */
export interface CreateSettlementRequest {
  order_id: string;
  wholesaler_id: string;
  order_amount: number;
  platform_fee_rate: number; // 기본값: 0.05 (5%)
}

/**
 * 정산 계산 결과 타입
 */
export interface SettlementCalculation {
  order_amount: number;
  platform_fee_rate: number;
  platform_fee: number;
  wholesaler_amount: number;
  scheduled_payout_at: string; // D+7 날짜 계산
}

/**
 * 정산 상세 정보 타입 (주문 정보 포함)
 */
export interface SettlementDetail extends Settlement {
  order: Order;
}

/**
 * 정산 목록 조회 필터 타입
 */
export interface SettlementFilter {
  wholesaler_id?: string;
  order_id?: string;
  status?: SettlementStatus;
  start_date?: string; // ISO 8601 형식
  end_date?: string; // ISO 8601 형식
}

/**
 * 정산 완료 요청 타입 (관리자용)
 */
export interface CompleteSettlementRequest {
  settlement_id: string;
  completed_at: string; // ISO 8601 형식
}

/**
 * 정산 통계 타입
 */
export interface SettlementStats {
  total_amount: number; // 총 정산 예정액
  total_platform_fee: number; // 총 플랫폼 수수료
  total_wholesaler_amount: number; // 총 도매 정산액
  pending_amount: number; // 정산 예정 금액 (pending 상태만)
  completed_amount: number; // 정산 완료 금액 (completed 상태만)
  pending_count: number; // 대기 중인 정산 수
  completed_count: number; // 완료된 정산 수
}

/**
 * 정산 계산 함수
 * @param orderAmount 주문 금액
 * @param platformFeeRate 플랫폼 수수료율 (예: 0.05 = 5%)
 * @param daysToPayout 정산 예정일까지 일수 (기본값: 7)
 * @returns 정산 계산 결과
 */
export function calculateSettlement(
  orderAmount: number,
  platformFeeRate: number = 0.05,
  daysToPayout: number = 7,
): SettlementCalculation {
  const platformFee = Math.floor(orderAmount * platformFeeRate);
  const wholesalerAmount = orderAmount - platformFee;

  // D+7 날짜 계산
  const scheduledPayoutAt = new Date();
  scheduledPayoutAt.setDate(scheduledPayoutAt.getDate() + daysToPayout);

  return {
    order_amount: orderAmount,
    platform_fee_rate: platformFeeRate,
    platform_fee: platformFee,
    wholesaler_amount: wholesalerAmount,
    scheduled_payout_at: scheduledPayoutAt.toISOString(),
  };
}
