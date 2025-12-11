-- ============================================
-- 도매-소매 중개 플랫폼 DB 스키마 (통합 버전)
-- ============================================
-- 
-- 📌 테이블 구조 개요:
-- 
-- 1. 인증 및 사용자 관리 (2-tier)
--    profiles (Clerk 인증 + 역할) → users (상세 프로필)
--    ├── profiles: clerk_user_id, email, role, status
--    └── users: profile_id (FK), name, phone, avatar_url
-- 
-- 2. 역할별 상세 정보 (profiles 기반)
--    profiles → retailers (소매 상세)
--    profiles → wholesalers (도매 상세)
-- 
-- 3. 상품 및 주문
--    wholesalers → products → product_variants (옵션)
--    retailers + products → cart_items (장바구니)
--    retailers + products → orders → settlements (정산)
-- 
-- 4. 기타
--    profiles → cs_threads → cs_messages (고객지원)
--    profiles → audit_logs (감사 로그)
--    products → ai_product_suggestions (AI 제안)
-- 
-- ============================================

-- 트리거 함수 생성: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 테이블 생성 및 제약조건 적용

CREATE TABLE "retailers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "business_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE "wholesalers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "business_name" TEXT NOT NULL,
    "business_number" TEXT NOT NULL UNIQUE,
    "representative" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "bank_account" TEXT NOT NULL,
    "anonymous_code" TEXT NOT NULL UNIQUE,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "approved_at" TIMESTAMPTZ
);
COMMENT ON COLUMN "wholesalers"."anonymous_code" IS '소매에게 노출되는 익명 코드 (예: VENDOR-001)';
COMMENT ON COLUMN "wholesalers"."status" IS 'pending(승인대기), approved(승인), rejected(반려), suspended(정지)';

CREATE TABLE "products" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "wholesaler_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specification" TEXT,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "moq" INTEGER DEFAULT 1 NOT NULL,
    "shipping_fee" INTEGER DEFAULT 0 NOT NULL,
    "delivery_method" TEXT DEFAULT 'courier',
    "stock_quantity" INTEGER DEFAULT 0 NOT NULL,
    "image_url" TEXT,
    "is_active" BOOLEAN DEFAULT true NOT NULL,
    "standardized_name" TEXT,
    "ai_suggested_category" TEXT,
    "ai_keywords" TEXT[],
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON COLUMN "products"."ai_keywords" IS 'AI가 추출한 검색 키워드 배열';
COMMENT ON COLUMN "products"."delivery_method" IS '배송 방법: courier(택배), direct(직배송), quick(퀵서비스), freight(화물), dawn(새벽배송)';

CREATE TABLE "product_variants" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stock_quantity" INTEGER DEFAULT 0 NOT NULL,
    "is_active" BOOLEAN DEFAULT true NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON COLUMN "product_variants"."name" IS '옵션명 (예: 1kg, 5kg, 10kg)';

CREATE TABLE "orders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "retailer_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "wholesaler_id" UUID NOT NULL,
    "variant_id" UUID,
    "order_number" TEXT NOT NULL UNIQUE,
    "quantity" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,
    "shipping_fee" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "request_note" TEXT,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON COLUMN "orders"."status" IS 'pending, confirmed, shipped, completed, cancelled';
COMMENT ON COLUMN "orders"."variant_id" IS '상품 옵션 ID (옵션이 없는 상품은 NULL)';

CREATE TABLE "settlements" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "wholesaler_id" UUID NOT NULL,
    "order_amount" INTEGER NOT NULL,
    "platform_fee_rate" DECIMAL(5,4) NOT NULL,
    "platform_fee" INTEGER NOT NULL,
    "wholesaler_amount" INTEGER NOT NULL,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "scheduled_payout_at" TIMESTAMPTZ NOT NULL,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON COLUMN "settlements"."status" IS 'pending, completed';
COMMENT ON COLUMN "settlements"."scheduled_payout_at" IS '정산 예정일 (예: D+7)';

CREATE TABLE "cart_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "retailer_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "quantity" INTEGER DEFAULT 1 NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON COLUMN "cart_items"."variant_id" IS '상품 옵션 ID (옵션이 없는 상품은 NULL)';

CREATE TABLE "cs_threads" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT DEFAULT 'open' NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "closed_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON COLUMN "cs_threads"."status" IS 'open, bot_handled, escalated, closed';

CREATE TABLE "payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "settlement_id" UUID NOT NULL,
    "method" VARCHAR(50) NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_key" VARCHAR(255),
    "status" VARCHAR(20) DEFAULT 'pending' NOT NULL,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON COLUMN "payments"."status" IS 'pending(결제대기), processing(결제진행중), paid(결제완료), failed(결제실패), cancelled(결제취소), refund_pending(환불진행중), refunded(환불완료)';

CREATE TABLE "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" UUID,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE "ai_product_suggestions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "wholesaler_id" UUID NOT NULL,
    "original_name" TEXT NOT NULL,
    "suggested_name" TEXT NOT NULL,
    "suggested_category" TEXT,
    "suggested_keywords" TEXT[],
    "confidence_score" DECIMAL(5,4),
    "accepted" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON COLUMN "ai_product_suggestions"."suggested_keywords" IS 'AI가 추천한 검색 키워드 배열';
COMMENT ON COLUMN "ai_product_suggestions"."confidence_score" IS 'AI 제안 신뢰도 (0.0000 ~ 1.0000)';

CREATE TABLE "cs_messages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "cs_thread_id" UUID NOT NULL,
    "sender_type" TEXT NOT NULL,
    "sender_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE "inquiries" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT DEFAULT 'open' NOT NULL,
    "admin_reply" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "replied_at" TIMESTAMPTZ
);

CREATE TABLE "profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clerk_user_id" TEXT NOT NULL UNIQUE,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT DEFAULT 'active' NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON TABLE "profiles" IS 'Clerk 인증 정보 및 역할 관리 테이블';
COMMENT ON COLUMN "profiles"."clerk_user_id" IS 'Clerk 사용자 ID (인증용)';
COMMENT ON COLUMN "profiles"."role" IS '사용자 역할: retailer, wholesaler, admin';

CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON TABLE "users" IS '사용자 상세 프로필 정보 테이블';
COMMENT ON COLUMN "users"."profile_id" IS 'profiles 테이블 참조 (1:1 관계)';

-- RLS 비활성화 (개발 환경용)
ALTER TABLE "profiles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE "profiles" TO anon;
GRANT ALL ON TABLE "profiles" TO authenticated;
GRANT ALL ON TABLE "profiles" TO service_role;

GRANT ALL ON TABLE "users" TO anon;
GRANT ALL ON TABLE "users" TO authenticated;
GRANT ALL ON TABLE "users" TO service_role;

-- 외래키 제약조건과 인덱스 추가

ALTER TABLE "orders" ADD CONSTRAINT fk_orders_retailer FOREIGN KEY ("retailer_id") REFERENCES "retailers"("id") ON DELETE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT fk_orders_product FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;
ALTER TABLE "orders" ADD CONSTRAINT fk_orders_wholesaler FOREIGN KEY ("wholesaler_id") REFERENCES "wholesalers"("id") ON DELETE RESTRICT;
ALTER TABLE "orders" ADD CONSTRAINT fk_orders_variant FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL;

ALTER TABLE "settlements" ADD CONSTRAINT fk_settlements_order FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
ALTER TABLE "settlements" ADD CONSTRAINT fk_settlements_wholesaler FOREIGN KEY ("wholesaler_id") REFERENCES "wholesalers"("id") ON DELETE RESTRICT;

ALTER TABLE "cart_items" ADD CONSTRAINT fk_cart_retailer FOREIGN KEY ("retailer_id") REFERENCES "retailers"("id") ON DELETE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT fk_cart_product FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT fk_cart_variant FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL;

ALTER TABLE "cs_threads" ADD CONSTRAINT fk_cs_threads_profile FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;

ALTER TABLE "products" ADD CONSTRAINT fk_products_wholesaler FOREIGN KEY ("wholesaler_id") REFERENCES "wholesalers"("id") ON DELETE RESTRICT;

ALTER TABLE "payments" ADD CONSTRAINT fk_payments_order FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT fk_payments_settlement FOREIGN KEY ("settlement_id") REFERENCES "settlements"("id") ON DELETE CASCADE;

ALTER TABLE "product_variants" ADD CONSTRAINT fk_product_variants_product FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;

ALTER TABLE "retailers" ADD CONSTRAINT fk_retailers_profile FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT fk_audit_logs_profile FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;

ALTER TABLE "ai_product_suggestions" ADD CONSTRAINT fk_ai_products_product FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
ALTER TABLE "ai_product_suggestions" ADD CONSTRAINT fk_ai_products_wholesaler FOREIGN KEY ("wholesaler_id") REFERENCES "wholesalers"("id") ON DELETE RESTRICT;

ALTER TABLE "cs_messages" ADD CONSTRAINT fk_cs_messages_thread FOREIGN KEY ("cs_thread_id") REFERENCES "cs_threads"("id") ON DELETE CASCADE;

ALTER TABLE "wholesalers" ADD CONSTRAINT fk_wholesalers_profile FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE;

ALTER TABLE "inquiries" ADD CONSTRAINT fk_inquiries_profile FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;

ALTER TABLE "users" ADD CONSTRAINT fk_users_profile FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE;

-- 인덱스 추가

CREATE INDEX idx_orders_retailer_id ON "orders" ("retailer_id");
CREATE INDEX idx_orders_product_id ON "orders" ("product_id");
CREATE INDEX idx_orders_wholesaler_id ON "orders" ("wholesaler_id");
CREATE INDEX idx_orders_variant_id ON "orders" ("variant_id");

CREATE INDEX idx_settlements_order_id ON "settlements" ("order_id");
CREATE INDEX idx_settlements_wholesaler_id ON "settlements" ("wholesaler_id");

CREATE INDEX idx_cart_retailer_id ON "cart_items" ("retailer_id");
CREATE INDEX idx_cart_product_id ON "cart_items" ("product_id");
CREATE INDEX idx_cart_variant_id ON "cart_items" ("variant_id");

CREATE INDEX idx_cs_threads_user_id ON "cs_threads" ("user_id");

CREATE INDEX idx_products_wholesaler_id ON "products" ("wholesaler_id");
CREATE INDEX idx_products_category ON "products" ("category");
CREATE INDEX idx_products_is_active ON "products" ("is_active");

CREATE INDEX idx_payments_order_id ON "payments" ("order_id");
CREATE INDEX idx_payments_settlement_id ON "payments" ("settlement_id");

CREATE INDEX idx_product_variants_product_id ON "product_variants" ("product_id");

CREATE INDEX idx_retailers_profile_id ON "retailers" ("profile_id");

CREATE INDEX idx_audit_logs_user_id ON "audit_logs" ("user_id");

CREATE INDEX idx_ai_product_suggestions_product_id ON "ai_product_suggestions" ("product_id");
CREATE INDEX idx_ai_product_suggestions_wholesaler_id ON "ai_product_suggestions" ("wholesaler_id");

CREATE INDEX idx_cs_messages_cs_thread_id ON "cs_messages" ("cs_thread_id");

CREATE INDEX idx_wholesalers_profile_id ON "wholesalers" ("profile_id");
CREATE INDEX idx_wholesalers_status ON "wholesalers" ("status");

CREATE INDEX idx_inquiries_user_id ON "inquiries" ("user_id");
CREATE INDEX idx_inquiries_status ON "inquiries" ("status");

CREATE INDEX idx_profiles_clerk_user_id ON "profiles" ("clerk_user_id");
CREATE INDEX idx_profiles_role ON "profiles" ("role");
CREATE INDEX idx_profiles_status ON "profiles" ("status");

CREATE INDEX idx_users_profile_id ON "users" ("profile_id");

-- 각 테이블에 updated_at 트리거 적용

CREATE TRIGGER trg_update_orders_updated_at BEFORE UPDATE ON "orders" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_settlements_updated_at BEFORE UPDATE ON "settlements" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_cart_items_updated_at BEFORE UPDATE ON "cart_items" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_cs_threads_updated_at BEFORE UPDATE ON "cs_threads" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_products_updated_at BEFORE UPDATE ON "products" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_payments_updated_at BEFORE UPDATE ON "payments" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_product_variants_updated_at BEFORE UPDATE ON "product_variants" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_profiles_updated_at BEFORE UPDATE ON "profiles" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- CHECK 제약조건 추가 (데이터 무결성 보장)

-- profiles 테이블
ALTER TABLE "profiles" ADD CONSTRAINT chk_profiles_role 
  CHECK (role IN ('retailer', 'wholesaler', 'admin'));
ALTER TABLE "profiles" ADD CONSTRAINT chk_profiles_status 
  CHECK (status IN ('active', 'suspended'));

-- wholesalers 테이블
ALTER TABLE "wholesalers" ADD CONSTRAINT chk_wholesalers_status 
  CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

-- products 테이블
ALTER TABLE "products" ADD CONSTRAINT chk_products_moq 
  CHECK (moq > 0);
ALTER TABLE "products" ADD CONSTRAINT chk_products_price 
  CHECK (price >= 0);
ALTER TABLE "products" ADD CONSTRAINT chk_products_delivery_method 
  CHECK (delivery_method IN ('courier', 'direct', 'quick', 'freight', 'dawn'));

-- product_variants 테이블
ALTER TABLE "product_variants" ADD CONSTRAINT chk_product_variants_price 
  CHECK (price >= 0);

-- orders 테이블
ALTER TABLE "orders" ADD CONSTRAINT chk_orders_status 
  CHECK (status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled'));
ALTER TABLE "orders" ADD CONSTRAINT chk_orders_quantity 
  CHECK (quantity > 0);
ALTER TABLE "orders" ADD CONSTRAINT chk_orders_amounts 
  CHECK (unit_price >= 0 AND shipping_fee >= 0 AND total_amount >= 0);

-- settlements 테이블
ALTER TABLE "settlements" ADD CONSTRAINT chk_settlements_status 
  CHECK (status IN ('pending', 'completed'));
ALTER TABLE "settlements" ADD CONSTRAINT chk_settlements_amounts 
  CHECK (order_amount >= 0 AND platform_fee >= 0 AND wholesaler_amount >= 0);
ALTER TABLE "settlements" ADD CONSTRAINT chk_settlements_fee_rate 
  CHECK (platform_fee_rate >= 0 AND platform_fee_rate <= 1);

-- cart_items 테이블
ALTER TABLE "cart_items" ADD CONSTRAINT chk_cart_items_quantity 
  CHECK (quantity > 0);

-- cs_threads 테이블
ALTER TABLE "cs_threads" ADD CONSTRAINT chk_cs_threads_status 
  CHECK (status IN ('open', 'bot_handled', 'escalated', 'closed'));

-- cs_messages 테이블
ALTER TABLE "cs_messages" ADD CONSTRAINT chk_cs_messages_sender_type 
  CHECK (sender_type IN ('user', 'bot', 'admin'));

-- inquiries 테이블
ALTER TABLE "inquiries" ADD CONSTRAINT chk_inquiries_status 
  CHECK (status IN ('open', 'answered', 'closed'));

-- payments 테이블
ALTER TABLE "payments" ADD CONSTRAINT chk_payments_amount 
  CHECK (amount >= 0);
ALTER TABLE "payments" ADD CONSTRAINT chk_payments_status 
  CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refund_pending', 'refunded'));

-- ai_product_suggestions 테이블
ALTER TABLE "ai_product_suggestions" ADD CONSTRAINT chk_ai_suggestions_confidence 
  CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1));

