-- 관리자가 products 테이블의 상품을 삭제할 수 있도록 RLS 정책 수정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Products delete" ON products;

-- 관리자도 삭제 가능하도록 정책 재생성
CREATE POLICY "Products delete" 
ON products FOR DELETE 
TO authenticated 
USING (
  -- 도매점은 자신의 상품만 삭제 가능
  (
    current_profile_id() IS NOT NULL AND
    EXISTS(
      SELECT 1 FROM wholesalers w 
      WHERE w.id = products.wholesaler_id 
      AND w.profile_id = current_profile_id()
    )
  )
  OR
  -- 관리자는 모든 상품 삭제 가능
  is_admin()
);

