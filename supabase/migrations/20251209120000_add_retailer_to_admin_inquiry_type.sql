-- 소매 → 관리자 문의 타입 추가 및 기본값 설정
-- - inquiry_type에 'retailer_to_admin' 추가 (기존 컬럼은 TEXT, 제약 없음)
-- - 기본값을 'retailer_to_admin'으로 설정하여 null 삽입 방지
-- - 기존 null 데이터를 'retailer_to_admin'으로 정규화

ALTER TABLE public.inquiries
  ALTER COLUMN inquiry_type SET DEFAULT 'retailer_to_admin';

COMMENT ON COLUMN public.inquiries.inquiry_type IS
  '문의 유형: retailer_to_wholesaler (소매→도매), wholesaler_to_admin (도매→관리자), retailer_to_admin (소매→관리자)';

UPDATE public.inquiries
SET inquiry_type = 'retailer_to_admin'
WHERE inquiry_type IS NULL;


