/**
 * @file constants.ts
 * @description 프로젝트 전반에서 사용하는 상수 정의
 *
 * 이 파일은 프로젝트 전반에서 사용하는 상수들을 정의합니다.
 * 모든 상수는 `as const`를 사용하여 타입 안전성을 보장합니다.
 *
 * @example
 * ```tsx
 * import { BANKS, ORDER_STATUS, DELIVERY_METHODS } from '@/lib/utils/constants';
 *
 * // 은행 목록
 * <Select>
 *   {BANKS.map(bank => <option key={bank}>{bank}</option>)}
 * </Select>
 *
 * // 주문 상태 확인
 * if (order.status === ORDER_STATUS.PENDING) { ... }
 *
 * // 배송 방법 표시
 * const method = DELIVERY_METHODS.COURIER.label; // "택배"
 * ```
 *
 * @dependencies
 * - types/database.ts (타입 정의 참고)
 */

import type {
  OrderStatus,
  WholesalerStatus,
  DeliveryMethod,
  InquiryStatus,
} from "@/types/database";

/**
 * 은행 목록
 *
 * 계좌번호 입력 시 사용하는 은행 목록입니다.
 */
export const BANKS = [
  "KB국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "NH농협은행",
  "IBK기업은행",
  "SC제일은행",
  "카카오뱅크",
  "토스뱅크",
  "케이뱅크",
] as const;

/**
 * 주문 상태 상수
 *
 * orders 테이블의 status 필드 값과 일치합니다.
 */
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const satisfies Record<string, OrderStatus>;

/**
 * 도매 승인 상태 상수
 *
 * wholesalers 테이블의 status 필드 값과 일치합니다.
 */
export const WHOLESALER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
} as const satisfies Record<string, WholesalerStatus>;

/**
 * 배송 방법 상수
 *
 * products 테이블의 delivery_method 필드 값과 일치합니다.
 * 각 항목은 value(DB 값)와 label(화면 표시용)을 포함합니다.
 */
export const DELIVERY_METHODS = {
  COURIER: { value: "courier", label: "택배" },
  DIRECT: { value: "direct", label: "직배송" },
  QUICK: { value: "quick", label: "퀵서비스" },
  FREIGHT: { value: "freight", label: "화물" },
  PICKUP: { value: "pickup", label: "픽업" },
} as const satisfies Record<string, { value: DeliveryMethod; label: string }>;

/**
 * 상품 카테고리 목록
 *
 * products 테이블의 category 필드에 사용되는 카테고리 목록입니다.
 * 농수산물 중심의 카테고리로 구성됩니다.
 */
export const CATEGORIES = [
  "과일",
  "채소",
  "육류",
  "수산물",
  "곡물",
  "견과류",
  "건조식품",
  "냉동식품",
  "조미료",
  "기타",
] as const;

/**
 * 단위 목록
 *
 * 상품 규격(specification)이나 수량 표시에 사용되는 단위 목록입니다.
 */
export const UNITS = [
  "kg",
  "g",
  "박스",
  "개",
  "봉지",
  "팩",
  "병",
  "캔",
  "리터",
  "ml",
] as const;

/**
 * 문의 상태 상수 (선택)
 *
 * inquiries 테이블의 status 필드 값과 일치합니다.
 */
export const INQUIRY_STATUS = {
  OPEN: "open",
  ANSWERED: "answered",
  CLOSED: "closed",
} as const satisfies Record<string, InquiryStatus>;

/**
 * 배송 방법 배열 (Select 컴포넌트용)
 *
 * DELIVERY_METHODS를 배열 형태로 변환한 것입니다.
 * Select 컴포넌트에서 사용하기 편리합니다.
 */
export const DELIVERY_METHODS_ARRAY = Object.values(DELIVERY_METHODS) as Array<{
  value: DeliveryMethod;
  label: string;
}>;

/**
 * 주문 상태 배열 (Select 컴포넌트용)
 *
 * ORDER_STATUS를 배열 형태로 변환한 것입니다.
 */
export const ORDER_STATUS_ARRAY = Object.entries(ORDER_STATUS).map(
  ([key, value]) => ({
    key,
    value,
    label: getOrderStatusLabel(value),
  }),
);

/**
 * 도매 승인 상태 배열 (Select 컴포넌트용)
 *
 * WHOLESALER_STATUS를 배열 형태로 변환한 것입니다.
 */
export const WHOLESALER_STATUS_ARRAY = Object.entries(WHOLESALER_STATUS).map(
  ([key, value]) => ({
    key,
    value,
    label: getWholesalerStatusLabel(value),
  }),
);

/**
 * 주문 상태 한글 라벨 반환
 *
 * @param {OrderStatus} status - 주문 상태
 * @returns {string} 한글 라벨
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: "대기 중",
    confirmed: "접수 완료",
    shipped: "출고 완료",
    completed: "배송 완료",
    cancelled: "취소됨",
  };
  return labels[status] || status;
}

/**
 * 도매 승인 상태 한글 라벨 반환
 *
 * @param {WholesalerStatus} status - 도매 승인 상태
 * @returns {string} 한글 라벨
 */
export function getWholesalerStatusLabel(status: WholesalerStatus): string {
  const labels: Record<WholesalerStatus, string> = {
    pending: "승인 대기",
    approved: "승인됨",
    rejected: "반려됨",
    suspended: "정지됨",
  };
  return labels[status] || status;
}

/**
 * 배송 방법 한글 라벨 반환
 *
 * @param {DeliveryMethod} method - 배송 방법
 * @returns {string} 한글 라벨
 */
export function getDeliveryMethodLabel(method: DeliveryMethod): string {
  const entry = Object.values(DELIVERY_METHODS).find(
    (item) => item.value === method,
  );
  return entry?.label || method;
}

/**
 * 문의 상태 한글 라벨 반환
 *
 * @param {InquiryStatus} status - 문의 상태
 * @returns {string} 한글 라벨
 */
export function getInquiryStatusLabel(status: InquiryStatus): string {
  const labels: Record<InquiryStatus, string> = {
    open: "답변 대기",
    answered: "답변 완료",
    closed: "종료됨",
  };
  return labels[status] || status;
}
