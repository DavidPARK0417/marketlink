-- ============================================
-- inquiries 테이블에 product_id 필드 추가
-- ============================================
-- 
-- 목적: 소매점이 도매점의 상품에 대한 문의를 작성할 때,
--       어떤 상품에 대한 문의인지 추적할 수 있도록 함
-- 
-- 추가 필드:
-- 1. product_id: 소매→도매 문의의 경우 관련 상품 ID
-- 
-- 참고:
-- - retailer_to_wholesaler 타입의 문의에서 사용
-- - 상품이 삭제되어도 문의는 유지되도록 ON DELETE SET NULL 사용
-- ============================================

-- product_id 필드 추가
ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS product_id UUID;

COMMENT ON COLUMN public.inquiries.product_id IS 
  '소매→도매 문의의 경우 관련 상품 ID (products 테이블 참조). 상품이 삭제되어도 문의는 유지됨';

-- 외래키 제약조건 추가
ALTER TABLE public.inquiries
ADD CONSTRAINT fk_inquiries_product 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE SET NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_inquiries_product_id 
ON public.inquiries (product_id);

