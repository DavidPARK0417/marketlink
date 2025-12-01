-- 농축수산물 품목 및 등급 코드표 테이블 생성
CREATE TABLE IF NOT EXISTS product_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_no INTEGER UNIQUE NOT NULL, -- 품목번호
  대분류명 TEXT NOT NULL,
  대분류코드 TEXT NOT NULL,
  중분류명 TEXT NOT NULL,
  중분류코드 TEXT NOT NULL,
  소분류명 TEXT NOT NULL,
  소분류코드 TEXT NOT NULL,
  품목명 TEXT NOT NULL,
  품목코드 TEXT NOT NULL,
  단위명 TEXT NOT NULL,
  단위코드 TEXT NOT NULL,
  표시단위 TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_product_codes_품목명 ON product_codes(품목명);
CREATE INDEX IF NOT EXISTS idx_product_codes_대분류코드 ON product_codes(대분류코드);
CREATE INDEX IF NOT EXISTS idx_product_codes_단위코드 ON product_codes(단위코드);
CREATE INDEX IF NOT EXISTS idx_product_codes_소분류코드 ON product_codes(소분류코드);

-- 코멘트 추가
COMMENT ON TABLE product_codes IS '농축수산물 품목 및 등급 코드표';
COMMENT ON COLUMN product_codes.product_no IS '품목번호 (고유 식별자)';
COMMENT ON COLUMN product_codes.대분류코드 IS '대분류 코드 (01: 쌀, 02: 쌀 도정, 07: 과일류 소포장, 200: 채소류, 300: 특용작물, 400: 과일류, 600: 수산물)';
COMMENT ON COLUMN product_codes.단위코드 IS '단위 코드 (04: 소매, 05: 도매, 07/08: 소포장)';

