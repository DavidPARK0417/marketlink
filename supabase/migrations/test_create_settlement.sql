/**
 * @file test_create_settlement.sql
 * @description 테스트 정산 데이터 생성 SQL 스크립트
 *
 * Supabase SQL Editor에서 실행하여 테스트 정산 데이터를 생성합니다.
 * 
 * 사용 데이터:
 * - order_id: a2d4c267-b34d-4087-802b-df105547d35b
 * - wholesaler_id: 96119cbc-05f4-451d-9cfc-d31bf3c9ddee
 *
 * ⚠️ 주의: 이미 정산이 존재하는 경우 중복 생성되지 않습니다.
 */

-- 1단계: 주문 정보 확인
SELECT 
  id,
  wholesaler_id,
  total_amount,
  order_number,
  status,
  created_at,
  updated_at
FROM orders
WHERE id = 'a2d4c267-b34d-4087-802b-df105547d35b';

-- 2단계: 이미 정산이 있는지 확인
SELECT 
  id,
  order_id,
  wholesaler_id,
  order_amount,
  platform_fee,
  wholesaler_amount,
  status,
  scheduled_payout_at,
  created_at
FROM settlements
WHERE order_id = 'a2d4c267-b34d-4087-802b-df105547d35b';

-- 3단계: 정산 데이터 생성
-- 주문의 실제 total_amount를 사용하거나, 없으면 100000 사용
-- ⚠️ 주의: 이미 정산이 있는지 2단계에서 확인 후 실행하세요
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
  'a2d4c267-b34d-4087-802b-df105547d35b' AS order_id,
  '96119cbc-05f4-451d-9cfc-d31bf3c9ddee' AS wholesaler_id,
  COALESCE(o.total_amount, 100000) AS order_amount,
  0.05 AS platform_fee_rate,
  FLOOR(COALESCE(o.total_amount, 100000) * 0.05) AS platform_fee,
  COALESCE(o.total_amount, 100000) - FLOOR(COALESCE(o.total_amount, 100000) * 0.05) AS wholesaler_amount,
  'pending' AS status,
  NOW() + INTERVAL '7 days' AS scheduled_payout_at
FROM orders o
WHERE o.id = 'a2d4c267-b34d-4087-802b-df105547d35b'
  AND o.wholesaler_id = '96119cbc-05f4-451d-9cfc-d31bf3c9ddee'
  -- 이미 정산이 없는 경우만 삽입
  AND NOT EXISTS (
    SELECT 1 FROM settlements s 
    WHERE s.order_id = 'a2d4c267-b34d-4087-802b-df105547d35b'
  );

-- 4단계: 생성된 정산 데이터 확인
SELECT 
  s.id,
  s.order_id,
  s.wholesaler_id,
  s.order_amount,
  s.platform_fee_rate,
  s.platform_fee,
  s.wholesaler_amount,
  s.status,
  s.scheduled_payout_at,
  s.created_at,
  o.order_number,
  o.total_amount AS order_total_amount
FROM settlements s
JOIN orders o ON s.order_id = o.id
WHERE s.order_id = 'a2d4c267-b34d-4087-802b-df105547d35b';

-- 5단계: 정산 계산 검증
-- 생성된 정산 데이터의 계산이 올바른지 확인
SELECT 
  id,
  order_amount,
  platform_fee_rate,
  platform_fee,
  wholesaler_amount,
  -- 계산 검증
  CASE 
    WHEN platform_fee = FLOOR(order_amount * platform_fee_rate) 
      AND wholesaler_amount = order_amount - platform_fee
    THEN '✅ 계산 정확'
    ELSE '❌ 계산 오류'
  END AS calculation_check,
  -- 예상 값
  FLOOR(order_amount * platform_fee_rate) AS expected_platform_fee,
  order_amount - FLOOR(order_amount * platform_fee_rate) AS expected_wholesaler_amount
FROM settlements
WHERE order_id = 'a2d4c267-b34d-4087-802b-df105547d35b';

