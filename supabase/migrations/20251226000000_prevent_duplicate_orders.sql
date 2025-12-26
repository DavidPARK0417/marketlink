/**
 * @file 20251226000000_prevent_duplicate_orders.sql
 * @description 주문 중복 생성 방지 마이그레이션
 * 
 * 문제 상황:
 * - 같은 결제 세션에서 주문이 2번 생성되는 현상 발생
 * - 같은 payment_key로 여러 주문이 생성됨
 * 
 * 해결 방법:
 * 1. 주문 생성 시 중복 체크 함수 추가
 * 2. 결제 승인 API에서 중복 체크 강화
 */

-- 1. 주문 중복 생성 방지를 위한 함수 생성
-- 같은 결제 세션(orderId)에서 이미 주문이 생성되었는지 확인하는 함수
CREATE OR REPLACE FUNCTION check_duplicate_order(
  p_retailer_id UUID,
  p_product_id UUID,
  p_wholesaler_id UUID,
  p_variant_id UUID,
  p_order_number TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- 같은 소매점, 같은 상품, 같은 도매점, 같은 옵션으로
  -- 최근 5초 이내에 생성된 주문이 있는지 확인
  SELECT EXISTS(
    SELECT 1
    FROM orders
    WHERE retailer_id = p_retailer_id
      AND product_id = p_product_id
      AND wholesaler_id = p_wholesaler_id
      AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL))
      AND created_at >= NOW() - INTERVAL '5 seconds'
      AND order_number != p_order_number -- 자기 자신은 제외
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

-- 함수에 대한 코멘트 추가
COMMENT ON FUNCTION check_duplicate_order IS '주문 중복 생성 방지를 위한 체크 함수. 같은 소매점, 상품, 도매점, 옵션으로 최근 5초 이내에 생성된 주문이 있는지 확인합니다.';

-- 2. payment_key가 NULL이 아닐 때 UNIQUE 제약 추가 (선택사항)
-- 주의: 결제 전 주문은 payment_key가 NULL이므로 이 제약은 결제 완료 후에만 적용됨
-- 같은 payment_key로 여러 주문이 생성되는 것을 방지
-- CREATE UNIQUE INDEX idx_orders_payment_key_unique 
-- ON orders(payment_key) 
-- WHERE payment_key IS NOT NULL;

-- 3. 주문 생성 트리거 추가 (선택사항)
-- 주문 생성 시 자동으로 중복 체크하는 트리거
-- 주의: 이 트리거는 클라이언트에서 직접 Supabase를 호출하는 경우에만 작동
-- CREATE OR REPLACE FUNCTION prevent_duplicate_order_insert()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF check_duplicate_order(
--     NEW.retailer_id,
--     NEW.product_id,
--     NEW.wholesaler_id,
--     NEW.variant_id,
--     NEW.order_number
--   ) THEN
--     RAISE EXCEPTION '중복 주문 생성 시도: 최근 5초 이내에 동일한 주문이 이미 생성되었습니다.';
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- 
-- CREATE TRIGGER trg_prevent_duplicate_order
-- BEFORE INSERT ON orders
-- FOR EACH ROW
-- EXECUTE FUNCTION prevent_duplicate_order_insert();

