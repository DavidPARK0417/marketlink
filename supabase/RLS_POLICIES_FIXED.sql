-- =================================================================
-- RLS 완전 수정 버전 v2.1 - Supabase MCP 검증 완료
-- =================================================================
-- 검토: 2025-12-19 | Supabase PostgreSQL 16 호환
-- 주요 수정:
-- 1. auth.jwt() 표준 방식 사용 (request.jwt.claims 대신)
-- 2. FOR ALL 문법 완전 제거 (모든 정책 분리)
-- 3. CREATE INDEX CONCURRENTLY 제거 (트랜잭션 외부 실행 필요)
-- 4. NULL 안전 처리 강화
-- 5. 정책 로직 검증 및 수정
-- =================================================================

-- =================================================================
-- 0. 기존 정책 완전 삭제 (안전)
-- =================================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- =================================================================
-- 1. 안전한 Helper Functions (Supabase 표준 방식)
-- =================================================================
DROP FUNCTION IF EXISTS current_clerk_id() CASCADE;
CREATE OR REPLACE FUNCTION current_clerk_id()
RETURNS text AS $$
  SELECT nullif(auth.jwt() ->> 'sub', '')
$$ LANGUAGE sql STABLE SECURITY DEFINER;

DROP FUNCTION IF EXISTS is_admin() CASCADE;
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM profiles 
    WHERE clerk_user_id = current_clerk_id() 
    AND role = 'admin'
    AND role IS NOT NULL
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

DROP FUNCTION IF EXISTS current_profile_id() CASCADE;
CREATE OR REPLACE FUNCTION current_profile_id()
RETURNS uuid AS $$
  SELECT id FROM profiles WHERE clerk_user_id = current_clerk_id() LIMIT 1
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =================================================================
-- 2. RLS 활성화 (존재하는 테이블만)
-- =================================================================
DO $$
DECLARE
  table_names TEXT[] := ARRAY[
    'profiles', 'users', 'wholesalers', 'retailers', 'products',
    'product_variants', 'orders', 'cart_items', 'settlements',
    'payments', 'inquiries', 'inquiry_messages', 'cs_threads',
    'cs_messages', 'audit_logs', 'announcements', 'faqs',
    'ai_product_suggestions', 'account_deletions'
  ];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY table_names LOOP
    IF EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    END IF;
  END LOOP;
END $$;

-- =================================================================
-- 3. Profiles (가장 중요)
-- =================================================================
CREATE POLICY "Profiles view" 
ON profiles FOR SELECT 
TO authenticated 
USING (clerk_user_id = current_clerk_id() OR is_admin());

CREATE POLICY "Profiles update" 
ON profiles FOR UPDATE 
TO authenticated 
USING (clerk_user_id = current_clerk_id());

CREATE POLICY "Profiles insert" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (clerk_user_id = current_clerk_id());

-- =================================================================
-- 4. Users
-- =================================================================
CREATE POLICY "Users view" 
ON users FOR SELECT 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND current_profile_id() = profile_id) 
  OR is_admin()
);

CREATE POLICY "Users update" 
ON users FOR UPDATE 
TO authenticated 
USING (current_profile_id() IS NOT NULL AND current_profile_id() = profile_id);

CREATE POLICY "Users insert" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (current_profile_id() IS NOT NULL AND current_profile_id() = profile_id);

-- =================================================================
-- 5. Wholesalers & Retailers (공개 조회, FOR ALL 분리)
-- =================================================================

-- [wholesalers]
CREATE POLICY "Wholesalers view" 
ON wholesalers FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Wholesalers insert" 
ON wholesalers FOR INSERT 
TO authenticated 
WITH CHECK (current_profile_id() IS NOT NULL AND current_profile_id() = profile_id);

CREATE POLICY "Wholesalers update" 
ON wholesalers FOR UPDATE 
TO authenticated 
USING (current_profile_id() IS NOT NULL AND current_profile_id() = profile_id);

CREATE POLICY "Wholesalers delete" 
ON wholesalers FOR DELETE 
TO authenticated 
USING (current_profile_id() IS NOT NULL AND current_profile_id() = profile_id);

-- [retailers]
CREATE POLICY "Retailers view" 
ON retailers FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Retailers insert" 
ON retailers FOR INSERT 
TO authenticated 
WITH CHECK (current_profile_id() IS NOT NULL AND current_profile_id() = profile_id);

CREATE POLICY "Retailers update" 
ON retailers FOR UPDATE 
TO authenticated 
USING (current_profile_id() IS NOT NULL AND current_profile_id() = profile_id);

CREATE POLICY "Retailers delete" 
ON retailers FOR DELETE 
TO authenticated 
USING (current_profile_id() IS NOT NULL AND current_profile_id() = profile_id);

-- =================================================================
-- 6. Products & Variants (핵심 비즈니스)
-- =================================================================

-- [products]
CREATE POLICY "Products view" 
ON products FOR SELECT 
TO authenticated 
USING (
  is_active = true 
  OR 
  (current_profile_id() IS NOT NULL AND EXISTS(
    SELECT 1 FROM wholesalers w 
    WHERE w.id = products.wholesaler_id 
    AND w.profile_id = current_profile_id()
  ))
  OR 
  is_admin()
);

CREATE POLICY "Products insert" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM wholesalers w 
    WHERE w.id = products.wholesaler_id 
    AND w.profile_id = current_profile_id()
  )
);

CREATE POLICY "Products update" 
ON products FOR UPDATE 
TO authenticated 
USING (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM wholesalers w 
    WHERE w.id = products.wholesaler_id 
    AND w.profile_id = current_profile_id()
  )
);

CREATE POLICY "Products delete" 
ON products FOR DELETE 
TO authenticated 
USING (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM wholesalers w 
    WHERE w.id = products.wholesaler_id 
    AND w.profile_id = current_profile_id()
  )
);

-- [product_variants] - FOR ALL 분리
CREATE POLICY "Variants view" 
ON product_variants FOR SELECT 
TO authenticated 
USING (
  EXISTS(
    SELECT 1 FROM products p 
    WHERE p.id = product_variants.product_id 
    AND (
      p.is_active = true 
      OR 
      (current_profile_id() IS NOT NULL AND EXISTS(
        SELECT 1 FROM wholesalers w 
        WHERE w.id = p.wholesaler_id 
        AND w.profile_id = current_profile_id()
      ))
      OR 
      is_admin()
    )
  )
);

CREATE POLICY "Variants insert" 
ON product_variants FOR INSERT 
TO authenticated 
WITH CHECK (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM products p 
    JOIN wholesalers w ON p.wholesaler_id = w.id 
    WHERE p.id = product_variants.product_id 
    AND w.profile_id = current_profile_id()
  )
);

CREATE POLICY "Variants update" 
ON product_variants FOR UPDATE 
TO authenticated 
USING (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM products p 
    JOIN wholesalers w ON p.wholesaler_id = w.id 
    WHERE p.id = product_variants.product_id 
    AND w.profile_id = current_profile_id()
  )
);

CREATE POLICY "Variants delete" 
ON product_variants FOR DELETE 
TO authenticated 
USING (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM products p 
    JOIN wholesalers w ON p.wholesaler_id = w.id 
    WHERE p.id = product_variants.product_id 
    AND w.profile_id = current_profile_id()
  )
);

-- =================================================================
-- 7. Orders & Cart (FOR ALL 분리)
-- =================================================================

-- [cart_items] - FOR ALL 분리
CREATE POLICY "Cart select" 
ON cart_items FOR SELECT 
TO authenticated 
USING (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM retailers r 
    WHERE r.id = cart_items.retailer_id 
    AND r.profile_id = current_profile_id()
  )
);

CREATE POLICY "Cart insert" 
ON cart_items FOR INSERT 
TO authenticated 
WITH CHECK (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM retailers r 
    WHERE r.id = cart_items.retailer_id 
    AND r.profile_id = current_profile_id()
  )
);

CREATE POLICY "Cart update" 
ON cart_items FOR UPDATE 
TO authenticated 
USING (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM retailers r 
    WHERE r.id = cart_items.retailer_id 
    AND r.profile_id = current_profile_id()
  )
);

CREATE POLICY "Cart delete" 
ON cart_items FOR DELETE 
TO authenticated 
USING (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM retailers r 
    WHERE r.id = cart_items.retailer_id 
    AND r.profile_id = current_profile_id()
  )
);

-- [orders]
CREATE POLICY "Orders view" 
ON orders FOR SELECT 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND (
    EXISTS(SELECT 1 FROM retailers r WHERE r.id = orders.retailer_id AND r.profile_id = current_profile_id())
    OR 
    EXISTS(SELECT 1 FROM wholesalers w WHERE w.id = orders.wholesaler_id AND w.profile_id = current_profile_id())
  ))
  OR is_admin()
);

CREATE POLICY "Orders insert" 
ON orders FOR INSERT 
TO authenticated 
WITH CHECK (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM retailers r 
    WHERE r.id = orders.retailer_id 
    AND r.profile_id = current_profile_id()
  )
);

CREATE POLICY "Orders update" 
ON orders FOR UPDATE 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND (
    EXISTS(SELECT 1 FROM wholesalers w WHERE w.id = orders.wholesaler_id AND w.profile_id = current_profile_id())
    OR 
    EXISTS(SELECT 1 FROM retailers r WHERE r.id = orders.retailer_id AND r.profile_id = current_profile_id())
  ))
  OR is_admin()
);

-- =================================================================
-- 8. Settlements & Payments (관리자 중심)
-- =================================================================

-- [settlements]
CREATE POLICY "Settlements view" 
ON settlements FOR SELECT 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND EXISTS(
    SELECT 1 FROM wholesalers w 
    WHERE w.id = settlements.wholesaler_id 
    AND w.profile_id = current_profile_id()
  ))
  OR is_admin()
);

CREATE POLICY "Settlements insert" 
ON settlements FOR INSERT 
TO authenticated 
WITH CHECK (is_admin());

CREATE POLICY "Settlements update" 
ON settlements FOR UPDATE 
TO authenticated 
USING (
  is_admin()
  OR 
  (current_profile_id() IS NOT NULL AND EXISTS(
    SELECT 1 FROM wholesalers w 
    WHERE w.id = settlements.wholesaler_id 
    AND w.profile_id = current_profile_id()
  ))
);

-- [payments]
CREATE POLICY "Payments view" 
ON payments FOR SELECT 
TO authenticated 
USING (
  EXISTS(
    SELECT 1 FROM orders o
    WHERE o.id = payments.order_id 
    AND (
      (current_profile_id() IS NOT NULL AND EXISTS(
        SELECT 1 FROM retailers r WHERE r.id = o.retailer_id AND r.profile_id = current_profile_id()
      ))
      OR 
      (current_profile_id() IS NOT NULL AND EXISTS(
        SELECT 1 FROM wholesalers w WHERE w.id = o.wholesaler_id AND w.profile_id = current_profile_id()
      ))
    )
  )
  OR is_admin()
);

CREATE POLICY "Payments insert" 
ON payments FOR INSERT 
TO authenticated 
WITH CHECK (is_admin());

CREATE POLICY "Payments update" 
ON payments FOR UPDATE 
TO authenticated 
USING (is_admin());

-- =================================================================
-- 9. CS & Inquiries (참여자만, FOR ALL 분리)
-- =================================================================

-- [inquiries]
CREATE POLICY "Inquiries view" 
ON inquiries FOR SELECT 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND (
    user_id = current_profile_id() 
    OR 
    EXISTS(
      SELECT 1 FROM wholesalers w 
      WHERE w.id = inquiries.wholesaler_id 
      AND w.profile_id = current_profile_id()
    )
  ))
  OR is_admin()
);

CREATE POLICY "Inquiries insert" 
ON inquiries FOR INSERT 
TO authenticated 
WITH CHECK (current_profile_id() IS NOT NULL AND user_id = current_profile_id());

CREATE POLICY "Inquiries update" 
ON inquiries FOR UPDATE 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND (
    user_id = current_profile_id() 
    OR 
    EXISTS(
      SELECT 1 FROM wholesalers w 
      WHERE w.id = inquiries.wholesaler_id 
      AND w.profile_id = current_profile_id()
    )
  ))
  OR is_admin()
);

-- [inquiry_messages] - FOR ALL 분리
CREATE POLICY "Inquiry messages view" 
ON inquiry_messages FOR SELECT 
TO authenticated 
USING (
  EXISTS(
    SELECT 1 FROM inquiries i
    WHERE i.id = inquiry_messages.inquiry_id 
    AND (
      (current_profile_id() IS NOT NULL AND i.user_id = current_profile_id())
      OR 
      (current_profile_id() IS NOT NULL AND EXISTS(
        SELECT 1 FROM wholesalers w 
        WHERE w.id = i.wholesaler_id 
        AND w.profile_id = current_profile_id()
      ))
      OR is_admin()
    )
  )
);

CREATE POLICY "Inquiry messages insert" 
ON inquiry_messages FOR INSERT 
TO authenticated 
WITH CHECK (current_profile_id() IS NOT NULL AND sender_id = current_profile_id());

CREATE POLICY "Inquiry messages update" 
ON inquiry_messages FOR UPDATE 
TO authenticated 
USING (current_profile_id() IS NOT NULL AND sender_id = current_profile_id());

CREATE POLICY "Inquiry messages delete" 
ON inquiry_messages FOR DELETE 
TO authenticated 
USING (current_profile_id() IS NOT NULL AND sender_id = current_profile_id());

-- =================================================================
-- 10. CS Threads & Messages (FOR ALL 분리)
-- =================================================================

-- [cs_threads] - FOR ALL 분리
CREATE POLICY "CS threads view" 
ON cs_threads FOR SELECT 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND user_id = current_profile_id()) 
  OR is_admin()
);

CREATE POLICY "CS threads insert" 
ON cs_threads FOR INSERT 
TO authenticated 
WITH CHECK (current_profile_id() IS NOT NULL AND user_id = current_profile_id());

CREATE POLICY "CS threads update" 
ON cs_threads FOR UPDATE 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND user_id = current_profile_id()) 
  OR is_admin()
);

CREATE POLICY "CS threads delete" 
ON cs_threads FOR DELETE 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND user_id = current_profile_id()) 
  OR is_admin()
);

-- [cs_messages] - FOR ALL 분리
CREATE POLICY "CS messages view" 
ON cs_messages FOR SELECT 
TO authenticated 
USING (
  EXISTS(
    SELECT 1 FROM cs_threads t
    WHERE t.id = cs_messages.cs_thread_id 
    AND (
      (current_profile_id() IS NOT NULL AND t.user_id = current_profile_id())
      OR is_admin()
    )
  )
);

CREATE POLICY "CS messages insert" 
ON cs_messages FOR INSERT 
TO authenticated 
WITH CHECK (
  (current_profile_id() IS NOT NULL AND sender_id = current_profile_id()) 
  OR is_admin()
);

CREATE POLICY "CS messages update" 
ON cs_messages FOR UPDATE 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND sender_id = current_profile_id()) 
  OR is_admin()
);

CREATE POLICY "CS messages delete" 
ON cs_messages FOR DELETE 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND sender_id = current_profile_id()) 
  OR is_admin()
);

-- =================================================================
-- 11. Admin & Public (FOR ALL 분리)
-- =================================================================

-- [audit_logs] - FOR ALL 분리
CREATE POLICY "Audit logs view" 
ON audit_logs FOR SELECT 
TO authenticated 
USING (is_admin());

CREATE POLICY "Audit logs insert" 
ON audit_logs FOR INSERT 
TO authenticated 
WITH CHECK (is_admin());

-- [announcements] - FOR ALL 분리
CREATE POLICY "Announcements view" 
ON announcements FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Announcements insert" 
ON announcements FOR INSERT 
TO authenticated 
WITH CHECK (is_admin());

CREATE POLICY "Announcements update" 
ON announcements FOR UPDATE 
TO authenticated 
USING (is_admin());

CREATE POLICY "Announcements delete" 
ON announcements FOR DELETE 
TO authenticated 
USING (is_admin());

-- [faqs] - FOR ALL 분리
CREATE POLICY "FAQs view" 
ON faqs FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "FAQs insert" 
ON faqs FOR INSERT 
TO authenticated 
WITH CHECK (is_admin());

CREATE POLICY "FAQs update" 
ON faqs FOR UPDATE 
TO authenticated 
USING (is_admin());

CREATE POLICY "FAQs delete" 
ON faqs FOR DELETE 
TO authenticated 
USING (is_admin());

-- [ai_product_suggestions] - FOR ALL 분리
CREATE POLICY "AI suggestions view" 
ON ai_product_suggestions FOR SELECT 
TO authenticated 
USING (
  current_profile_id() IS NOT NULL AND
  EXISTS(
    SELECT 1 FROM wholesalers w 
    WHERE w.id = ai_product_suggestions.wholesaler_id 
    AND w.profile_id = current_profile_id()
  )
);

CREATE POLICY "AI suggestions insert" 
ON ai_product_suggestions FOR INSERT 
TO authenticated 
WITH CHECK (
  (current_profile_id() IS NOT NULL AND EXISTS(
    SELECT 1 FROM wholesalers w 
    WHERE w.id = ai_product_suggestions.wholesaler_id 
    AND w.profile_id = current_profile_id()
  ))
  OR is_admin()
);

CREATE POLICY "AI suggestions update" 
ON ai_product_suggestions FOR UPDATE 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND EXISTS(
    SELECT 1 FROM wholesalers w 
    WHERE w.id = ai_product_suggestions.wholesaler_id 
    AND w.profile_id = current_profile_id()
  ))
  OR is_admin()
);

CREATE POLICY "AI suggestions delete" 
ON ai_product_suggestions FOR DELETE 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND EXISTS(
    SELECT 1 FROM wholesalers w 
    WHERE w.id = ai_product_suggestions.wholesaler_id 
    AND w.profile_id = current_profile_id()
  ))
  OR is_admin()
);

-- [account_deletions] - FOR ALL 분리
CREATE POLICY "Account deletions view" 
ON account_deletions FOR SELECT 
TO authenticated 
USING (
  (current_profile_id() IS NOT NULL AND profile_id = current_profile_id()) 
  OR is_admin()
);

CREATE POLICY "Account deletions insert" 
ON account_deletions FOR INSERT 
TO authenticated 
WITH CHECK (current_profile_id() IS NOT NULL AND profile_id = current_profile_id());

-- =================================================================
-- 12. 성능 인덱스 (일반 인덱스로 변경 - CONCURRENTLY는 트랜잭션 외부에서 실행)
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_wholesalers_profile_id ON wholesalers(profile_id);
CREATE INDEX IF NOT EXISTS idx_retailers_profile_id ON retailers(profile_id);
CREATE INDEX IF NOT EXISTS idx_products_wholesaler_id ON products(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- =================================================================
-- 13. 검증 쿼리 (실행 후 확인)
-- =================================================================
-- 실행 후 다음 쿼리로 확인:
-- SELECT 
--   count(*) as total_policies,
--   count(CASE WHEN tablename = 'profiles' THEN 1 END) as profiles_policies
-- FROM pg_policies WHERE schemaname = 'public';

-- =================================================================
-- 14. 주의사항
-- =================================================================
-- ⚠️ 중요: 다음 테이블들은 시스템에서 자동 생성되므로
-- Service Role을 사용하여 INSERT하는 것이 더 안전합니다:
--   - settlements (정산)
--   - payments (결제)
--   - audit_logs (감사 로그)
--
-- 현재 정책은 관리자만 INSERT 가능하도록 설정되어 있으나,
-- 실제 운영 시에는 Service Role 사용을 권장합니다.
--
-- ✅ 수정 완료 사항:
-- 1. auth.jwt() 표준 방식 사용 (request.jwt.claims 대신)
-- 2. FOR ALL 문법 완전 제거 (모든 정책을 SELECT, INSERT, UPDATE, DELETE로 분리)
-- 3. CREATE INDEX CONCURRENTLY 제거 (일반 인덱스로 변경)
-- 4. NULL 안전 처리 강화 (current_profile_id() IS NOT NULL 체크 추가)
-- 5. EXISTS 서브쿼리 사용으로 성능 최적화
-- 6. 모든 정책에 TO authenticated 추가
