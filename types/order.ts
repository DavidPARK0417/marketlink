/**
 * @file order.ts
 * @description 주문 타입 정의
 *
 * 이 파일은 주문(orders) 관련 타입을 정의합니다.
 * 주문 생성, 상태 변경, 주문 조회 등을 포함합니다.
 *
 * @dependencies
 * - types/database.ts
 * - types/product.ts
 */

import type { OrderStatus } from "./database";
import type { Product, ProductVariant } from "./product";

// OrderStatus를 re-export하여 다른 파일에서도 types/order에서 import 가능하도록 함
export type { OrderStatus };

/**
 * 주문 테이블 타입
 * orders 테이블과 일치
 */
export interface Order {
  id: string;
  retailer_id: string;
  product_id: string;
  wholesaler_id: string;
  variant_id: string | null; // 상품 옵션 ID (옵션이 없는 상품은 NULL)
  order_number: string; // 예: "ORD-20251119-001"
  quantity: number;
  unit_price: number; // 주문 당시 단가 (옵션 가격)
  shipping_fee: number;
  total_amount: number; // unit_price * quantity + shipping_fee
  delivery_address: string;
  request_note: string | null;
  status: OrderStatus;
  wholesaler_read_at: string | null; // 도매점이 주문을 읽은 시간 (NULL이면 읽지 않음)
  created_at: string;
  updated_at: string;
}

/**
 * 주문 생성 요청 타입
 */
export interface CreateOrderRequest {
  retailer_id: string;
  product_id: string;
  wholesaler_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
  shipping_fee: number;
  total_amount: number;
  delivery_address: string;
  request_note?: string;
}

/**
 * 주문 상태 변경 요청 타입
 */
export interface UpdateOrderStatusRequest {
  order_id: string;
  status: OrderStatus;
}

/**
 * 주문 상세 정보 타입 (상품 정보 포함)
 */
export interface OrderDetail extends Order {
  product: Product;
  variant: ProductVariant | null;
}

/**
 * 주문 목록 조회 필터 타입
 */
export interface OrderFilter {
  retailer_id?: string;
  wholesaler_id?: string;
  product_id?: string;
  status?: OrderStatus;
  start_date?: string; // ISO 8601 형식
  end_date?: string; // ISO 8601 형식
  order_number?: string; // 주문번호 (정확 일치)
  customer_name?: string; // 고객명 (retailers.business_name 검색)
}

/**
 * 주문 번호 생성 함수 타입
 */
export type GenerateOrderNumber = () => string;

/**
 * 주문 상태 변경 가능한 다음 상태 타입
 */
export type NextOrderStatus =
  | "confirmed" // pending → confirmed
  | "shipped" // confirmed → shipped
  | "completed" // shipped → completed
  | "cancelled"; // pending → cancelled (취소)

/**
 * 주문 상태 변경 가능 여부 확인
 */
export function canChangeOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): boolean {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["completed"],
    completed: [], // 완료된 주문은 더 이상 변경 불가
    cancelled: [], // 취소된 주문은 더 이상 변경 불가
  };

  return statusFlow[currentStatus]?.includes(nextStatus) ?? false;
}
