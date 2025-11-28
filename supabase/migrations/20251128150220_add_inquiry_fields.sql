-- ============================================
-- inquiries 테이블에 문의 유형 및 연결 필드 추가
-- ============================================
-- 
-- 목적: 문의 관리 기능을 위한 필드 추가
-- 
-- 추가 필드:
-- 1. inquiry_type: 문의 유형 ('retailer_to_wholesaler', 'wholesaler_to_admin')
-- 2. wholesaler_id: 소매→도매 문의의 경우 대상 도매점 ID
-- 3. order_id: 소매→도매 문의의 경우 관련 주문 ID
-- 
-- 참고:
-- - inquiry_type이 'retailer_to_wholesaler'인 경우 wholesaler_id와 order_id 필수
-- - inquiry_type이 'wholesaler_to_admin'인 경우 wholesaler_id와 order_id NULL 가능
-- ============================================

-- inquiry_type 필드 추가
ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS inquiry_type TEXT;

COMMENT ON COLUMN public.inquiries.inquiry_type IS 
  '문의 유형: retailer_to_wholesaler (소매→도매), wholesaler_to_admin (도매→관리자)';

-- wholesaler_id 필드 추가
ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS wholesaler_id UUID;

COMMENT ON COLUMN public.inquiries.wholesaler_id IS 
  '소매→도매 문의의 경우 대상 도매점 ID (wholesalers 테이블 참조)';

-- order_id 필드 추가
ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS order_id UUID;

COMMENT ON COLUMN public.inquiries.order_id IS 
  '소매→도매 문의의 경우 관련 주문 ID (orders 테이블 참조)';

-- 외래키 제약조건 추가
ALTER TABLE public.inquiries
ADD CONSTRAINT fk_inquiries_wholesaler 
FOREIGN KEY (wholesaler_id) 
REFERENCES public.wholesalers(id) 
ON DELETE RESTRICT;

ALTER TABLE public.inquiries
ADD CONSTRAINT fk_inquiries_order 
FOREIGN KEY (order_id) 
REFERENCES public.orders(id) 
ON DELETE SET NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_inquiries_inquiry_type 
ON public.inquiries (inquiry_type);

CREATE INDEX IF NOT EXISTS idx_inquiries_wholesaler_id 
ON public.inquiries (wholesaler_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_order_id 
ON public.inquiries (order_id);

-- inquiry_type과 wholesaler_id 복합 인덱스 (도매점별 문의 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_inquiries_type_wholesaler 
ON public.inquiries (inquiry_type, wholesaler_id);

-- inquiry_type과 status 복합 인덱스 (상태별 필터링 최적화)
CREATE INDEX IF NOT EXISTS idx_inquiries_type_status 
ON public.inquiries (inquiry_type, status);

