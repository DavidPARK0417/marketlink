-- ============================================
-- products 테이블 제약조건 변경 (RESTRICT → CASCADE)
-- ============================================
-- 
-- 도매점 탈퇴 시 상품도 자동으로 삭제되도록 변경합니다.
-- 

-- 기존 제약조건 삭제
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "fk_products_wholesaler";

-- 새로운 제약조건 추가 (CASCADE)
ALTER TABLE "products" 
ADD CONSTRAINT "fk_products_wholesaler" 
FOREIGN KEY ("wholesaler_id") 
REFERENCES "wholesalers"("id") 
ON DELETE CASCADE;

-- 코멘트 업데이트
COMMENT ON CONSTRAINT "fk_products_wholesaler" ON "products" IS '도매점 삭제 시 상품도 자동 삭제 (CASCADE)';

