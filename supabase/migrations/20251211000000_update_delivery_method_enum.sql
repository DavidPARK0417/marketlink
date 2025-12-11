-- 배송 방법 체크 제약 및 주석을 최신 5종(delivery_method)으로 갱신
-- 기존: courier, direct, quick, freight, dawn (이전 스키마에서 dawn 미포함)
-- 변경: courier, direct, quick, freight, dawn

-- 제약조건 제거 후 재생성
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS chk_products_delivery_method;

ALTER TABLE public.products
ADD CONSTRAINT chk_products_delivery_method
CHECK (delivery_method IN ('courier', 'direct', 'quick', 'freight', 'dawn'));

-- 컬럼 주석 업데이트
COMMENT ON COLUMN public.products.delivery_method IS
  '배송 방법: courier(택배), direct(직배송), quick(퀵서비스), freight(화물), dawn(새벽배송)';

