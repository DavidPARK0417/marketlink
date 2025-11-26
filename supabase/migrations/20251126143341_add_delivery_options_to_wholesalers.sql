-- ============================================
-- wholesalers 테이블에 배송 옵션 관련 필드 추가
-- ============================================
-- 
-- 목적: 도매점 배송 옵션 설정 추가
-- 
-- 추가 필드:
-- 1. is_dawn_delivery_available: 새벽 배송 가능 여부
-- 2. delivery_time_slots: 배송 가능 시간대 배열
-- 
-- 참고:
-- - is_dawn_delivery_available는 기본값 false
-- - delivery_time_slots는 TEXT 배열로 저장 (예: ["02:00-06:00", "06:00-10:00"])
-- - 두 필드 모두 NULL 허용 (기존 데이터 호환성)
-- ============================================

-- is_dawn_delivery_available 필드 추가
ALTER TABLE public.wholesalers
ADD COLUMN IF NOT EXISTS is_dawn_delivery_available BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.wholesalers.is_dawn_delivery_available IS 
  '새벽 배송 가능 여부 (true: 가능, false: 불가능)';

-- delivery_time_slots 필드 추가 (배송 가능 시간대 배열)
ALTER TABLE public.wholesalers
ADD COLUMN IF NOT EXISTS delivery_time_slots TEXT[];

COMMENT ON COLUMN public.wholesalers.delivery_time_slots IS 
  '배송 가능 시간대 배열 (예: ["02:00-06:00", "06:00-10:00", "10:00-14:00"])';

