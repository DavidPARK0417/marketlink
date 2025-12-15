-- ============================================
-- products 테이블에 specifications JSONB 필드 추가
-- ============================================
-- 
-- 원산지와 생산지를 필수 입력사항으로 추가하기 위해
-- specifications JSONB 필드를 추가합니다.
--
-- specifications 구조:
-- {
--   "weight": "1kg",
--   "size": "10cm x 10cm",
--   "origin": "국내산",           -- 필수
--   "production_location": "경기도 안성시",  -- 필수
--   "storage": "냉장보관"
-- }
-- ============================================

-- 1) specifications JSONB 필드 추가
ALTER TABLE products
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;

-- 2) 기존 데이터 호환성: specification 필드가 있으면 specifications에 포함
-- (기존 specification은 그대로 유지하고, specifications에 추가 정보 저장)
UPDATE products
SET specifications = jsonb_build_object(
  'specification', specification
)
WHERE (specifications IS NULL OR specifications = '{}'::jsonb)
  AND specification IS NOT NULL;

-- 3) 인덱스 추가 (specifications 필드 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_products_specifications 
ON products USING GIN(specifications);

