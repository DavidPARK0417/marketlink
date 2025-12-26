/**
 * @file fix_missing_settlements.sql
 * @description 결제 완료되었지만 정산이 없는 주문들에 대한 정산 생성 스크립트
 * 
 * 문제 상황:
 * - 결제 완료(paid_at IS NOT NULL)되었지만 정산(settlements)이 생성되지 않은 주문들이 존재
 * - 같은 payment_key로 여러 주문이 생성되는 경우, 첫 번째 주문만 정산이 생성되고 나머지는 누락됨
 * 
 * 해결 방법:
 * - 결제 완료되었지만 정산이 없는 모든 주문에 대해 정산을 생성
 * - 수수료율: 5% (환경 변수: NEXT_PUBLIC_PLATFORM_FEE_RATE, 기본값: 0.05)
 * - 정산 예정일: 결제일 + 7일 (D+7)
 */

-- 1단계: 결제 완료되었지만 정산이 없는 주문 확인
SELECT 
  o.id,
  o.order_number,
  o.payment_key,
  o.paid_at,
  o.total_amount,
  o.wholesaler_id,
  s.id as settlement_id
FROM orders o
LEFT JOIN settlements s ON o.id = s.order_id
WHERE o.paid_at IS NOT NULL
  AND s.id IS NULL
ORDER BY o.created_at DESC;

-- 2단계: 정산 생성 (위 쿼리 결과를 확인한 후 실행)
-- ⚠️ 주의: WHERE 절에서 이미 정산이 있는 주문은 제외되므로 중복 생성되지 않습니다
INSERT INTO settlements (
  order_id,
  wholesaler_id,
  order_amount,
  platform_fee_rate,
  platform_fee,
  wholesaler_amount,
  status,
  scheduled_payout_at
)
SELECT 
  o.id AS order_id,
  o.wholesaler_id,
  o.total_amount AS order_amount,
  0.05 AS platform_fee_rate, -- 5% 수수료율
  FLOOR(o.total_amount * 0.05) AS platform_fee,
  o.total_amount - FLOOR(o.total_amount * 0.05) AS wholesaler_amount,
  'pending' AS status,
  (o.paid_at + INTERVAL '7 days') AS scheduled_payout_at -- 결제일 + 7일
FROM orders o
LEFT JOIN settlements s ON o.id = s.order_id
WHERE o.paid_at IS NOT NULL
  AND s.id IS NULL;

-- 3단계: 생성된 정산 확인
SELECT 
  s.id,
  s.order_id,
  o.order_number,
  s.order_amount,
  s.platform_fee,
  s.wholesaler_amount,
  s.status,
  s.scheduled_payout_at,
  s.created_at
FROM settlements s
JOIN orders o ON s.order_id = o.id
WHERE s.created_at >= NOW() - INTERVAL '1 hour' -- 최근 1시간 내 생성된 정산
ORDER BY s.created_at DESC;

