-- ============================================
-- products 테이블 필수 필드 제약 추가
-- ============================================
-- 
-- 규격 값, 상품 설명, 상품 이미지를 필수 입력사항으로 변경하기 위해
-- 데이터베이스 제약 조건을 추가합니다.
--
-- 변경 사항:
-- 1. description: NULL 허용 → NOT NULL
-- 2. specification: NULL 허용 → NOT NULL  
-- 3. images: 빈 배열 허용 → 최소 1개 이상 CHECK 제약 추가
-- ============================================

-- 1) 기존 NULL 값 처리 (기존 데이터 호환성)
-- description이 NULL인 경우 기본값 설정
UPDATE products
SET description = '상품 설명이 없습니다.'
WHERE description IS NULL;

-- specification이 NULL인 경우 기본값 설정
UPDATE products
SET specification = '1ea'
WHERE specification IS NULL;

-- images가 빈 배열인 경우 기본 이미지 URL 설정
-- 주의: 실제 운영 환경에서는 빈 배열인 상품을 삭제하거나
-- 기본 이미지를 설정하는 정책이 필요합니다.
-- 여기서는 예시로 기본값을 설정합니다.
UPDATE products
SET images = ARRAY['https://via.placeholder.com/400']
WHERE array_length(images, 1) IS NULL OR array_length(images, 1) = 0;

-- 2) NOT NULL 제약 추가
ALTER TABLE products
ALTER COLUMN description SET NOT NULL;

ALTER TABLE products
ALTER COLUMN specification SET NOT NULL;

-- 3) images 배열 최소 1개 이상 CHECK 제약 추가
ALTER TABLE products
ADD CONSTRAINT chk_products_images_not_empty 
CHECK (array_length(images, 1) >= 1);

-- 4) 기본값 설정 (새로 생성되는 레코드용)
ALTER TABLE products
ALTER COLUMN description SET DEFAULT '';

ALTER TABLE products
ALTER COLUMN specification SET DEFAULT '1ea';

