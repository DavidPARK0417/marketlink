-- ============================================
-- settlements.scheduled_payout_at을 NULL 허용으로 변경
-- ============================================
-- 
-- 목적: 정산 예정일을 배송완료일 + 7일로 변경하기 위해
--       정산 생성 시점에는 NULL로 설정하고,
--       주문 상태가 completed로 변경될 때 업데이트
-- 
-- 변경 사항:
-- - scheduled_payout_at: NOT NULL → NULL 허용
-- 
-- ============================================

-- scheduled_payout_at을 NULL 허용으로 변경
ALTER TABLE public.settlements
ALTER COLUMN scheduled_payout_at DROP NOT NULL;

COMMENT ON COLUMN public.settlements.scheduled_payout_at IS 
  '정산 예정일 (배송완료일 + 7일). 배송완료 전에는 NULL, completed 상태로 변경될 때 설정됨';

