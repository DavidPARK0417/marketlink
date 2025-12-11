/**
 * @file cart.ts
 * @description 장바구니 타입 정의
 *
 * 이 파일은 장바구니 관련 타입을 정의합니다.
 * Zustand 스토어에서 사용하는 장바구니 아이템 타입을 포함합니다.
 *
 * @dependencies
 * - types/product.ts
 * - types/wholesaler.ts
 */

/**
 * 배송 방법 타입 (상품 정의와 동일한 5종)
 */
export type DeliveryMethod =
  | "direct"
  | "dawn"
  | "quick"
  | "freight"
  | "courier";

/**
 * 장바구니 아이템 타입
 * 장바구니에 담긴 상품 정보를 나타냅니다.
 */
export interface CartItem {
  /** 장바구니 아이템 고유 ID */
  id: string;
  /** 상품 ID */
  product_id: string;
  /** 상품 옵션 ID (옵션이 없는 경우 null) */
  variant_id: string | null;
  /** 수량 */
  quantity: number;
  /** 단가 (주문 당시 가격) */
  unit_price: number;
  /** 배송 방법 (direct: 직배송, dawn: 새벽배송, quick: 퀵서비스, freight: 화물, courier: 택배) */
  delivery_method: DeliveryMethod;
  /** 도매상 ID */
  wholesaler_id: string;
  /** 표시용: AI 표준화된 상품명 */
  product_name: string;
  /** 표시용: 익명 판매자 식별자 (예: Partner #F2B-01) */
  anonymous_seller_id: string;
  /** 표시용: 판매자 지역 (시/구 단위) */
  seller_region: string;
  /** 표시용: 상품 이미지 URL */
  product_image: string | null;
  /** 표시용: 상품 규격 (예: 1kg, 1박스) */
  specification: string | null;
  /** 최소 주문 수량 (검증용) */
  moq: number;
  /** 재고 수량 (검증용) */
  stock_quantity: number;
}

/**
 * 장바구니 요약 정보 타입
 */
export interface CartSummary {
  /** 상품 총액 (단가 * 수량의 합) */
  totalProductPrice: number;
  /** 총 결제 예상 금액 (상품 총액) */
  totalPrice: number;
  /** 장바구니 아이템 개수 */
  itemCount: number;
}

/**
 * 장바구니에 추가할 상품 정보 타입
 * CartItem에서 id를 제외한 타입 (id는 자동 생성)
 */
export interface AddToCartInput {
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  delivery_method: DeliveryMethod;
  wholesaler_id: string;
  product_name: string;
  anonymous_seller_id: string;
  seller_region: string;
  product_image: string | null;
  specification: string | null;
  moq: number;
  stock_quantity: number;
}

/**
 * 장바구니 아이템 수정 정보 타입
 */
export interface UpdateCartItemInput {
  id: string;
  quantity?: number;
  unit_price?: number;
  delivery_method?: DeliveryMethod;
}

/**
 * 검증 에러 타입
 */
export interface ValidationError {
  /** 에러 코드 */
  code: "MOQ_NOT_MET" | "OUT_OF_STOCK" | "DEADLINE_PASSED" | "UNKNOWN";
  /** 에러 메시지 */
  message: string;
  /** 관련 상품 ID */
  product_id: string;
  /** 관련 상품명 */
  product_name: string;
}

/**
 * 장바구니 검증 결과 타입
 */
export interface CartValidationResult {
  /** 검증 통과 여부 */
  isValid: boolean;
  /** 에러 목록 */
  errors: ValidationError[];
}
