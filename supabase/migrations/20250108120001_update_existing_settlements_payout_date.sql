-- ============================================
-- 기존 정산 데이터의 scheduled_payout_at 업데이트
-- ============================================
-- 
-- 목적: 주문 상태가 completed인 경우 배송완료일(주문의 updated_at) + 7일로 업데이트
-- 
-- 실행 조건:
-- - scheduled_payout_at이 null이거나
-- - 주문 상태가 completed이고 scheduled_payout_at이 결제일 + 7일로 설정된 경우
-- 
-- ============================================

-- 주문 상태가 completed이고 scheduled_payout_at이 null인 경우 업데이트
UPDATE public.settlements s
SET scheduled_payout_at = (o.updated_at + INTERVAL '7 days')
FROM public.orders o
WHERE s.order_id = o.id
  AND o.status = 'completed'
  AND s.scheduled_payout_at IS NULL;

-- 주문 상태가 completed이고 scheduled_payout_at이 결제일 + 7일로 설정된 경우
-- 배송완료일(updated_at) + 7일로 업데이트
UPDATE public.settlements s
SET scheduled_payout_at = (o.updated_at + INTERVAL '7 days')
FROM public.orders o
WHERE s.order_id = o.id
  AND o.status = 'completed'
  AND s.scheduled_payout_at IS NOT NULL
  AND o.paid_at IS NOT NULL
  AND s.scheduled_payout_at = (o.paid_at + INTERVAL '7 days');

-- 업데이트 결과 확인
SELECT 
  s.id as settlement_id,
  s.order_id,
  o.status as order_status,
  o.paid_at,
  o.updated_at as delivery_completed_at,
  s.scheduled_payout_at,
  CASE 
    WHEN o.status = 'completed' THEN o.updated_at + INTERVAL '7 days'
    ELSE NULL
  END as calculated_payout_at
FROM public.settlements s
JOIN public.orders o ON s.order_id = o.id
WHERE o.status = 'completed'
ORDER BY s.created_at DESC
LIMIT 10;

