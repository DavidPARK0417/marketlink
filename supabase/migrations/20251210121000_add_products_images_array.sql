-- products 테이블에 다중 이미지 저장을 위한 images 컬럼 추가
-- 기존 image_url 값은 첫 번째 이미지로 백필하여 호환성 유지

-- 1) images 컬럼 추가 (기본값: 빈 배열)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'::text[];

-- 2) 기존 데이터 백필: image_url이 있으면 images 첫 요소로 채움
UPDATE products
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- 3) NOT NULL 제약으로 항상 배열 형태 유지
ALTER TABLE products
ALTER COLUMN images SET NOT NULL;

