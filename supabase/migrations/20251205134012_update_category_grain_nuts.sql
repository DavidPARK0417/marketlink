-- 카테고리 통합: 곡물, 견과류 → 곡물/견과류
-- 
-- 이 마이그레이션은 products 테이블의 category 필드에서
-- "곡물" 또는 "견과류"를 "곡물/견과류"로 통합합니다.
-- 소매 페이지와의 통일성을 위해 카테고리를 변경합니다.

-- 곡물 또는 견과류를 곡물/견과류로 통합
UPDATE products 
SET category = '곡물/견과류',
    updated_at = NOW()
WHERE category IN ('곡물', '견과류');

-- 변경된 레코드 수 확인 (주석 처리)
-- SELECT COUNT(*) FROM products WHERE category = '곡물/견과류';

