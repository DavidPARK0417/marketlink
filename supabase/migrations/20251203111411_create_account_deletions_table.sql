-- ============================================
-- 회원탈퇴 사유 수집 테이블 생성
-- ============================================
-- 
-- 탈퇴한 사용자의 사유를 수집하여 서비스 개선에 활용합니다.
-- 

CREATE TABLE IF NOT EXISTS "account_deletions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "reason" TEXT NOT NULL, -- 탈퇴 사유 (드롭다운 선택값)
    "feedback" TEXT, -- 추가 피드백 (선택사항)
    "deleted_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스 추가
CREATE INDEX idx_account_deletions_profile_id ON "account_deletions"("profile_id");
CREATE INDEX idx_account_deletions_deleted_at ON "account_deletions"("deleted_at");
CREATE INDEX idx_account_deletions_reason ON "account_deletions"("reason");

-- 코멘트 추가
COMMENT ON TABLE "account_deletions" IS '회원탈퇴 사유 수집 테이블';
COMMENT ON COLUMN "account_deletions"."profile_id" IS '탈퇴한 사용자의 profile ID';
COMMENT ON COLUMN "account_deletions"."reason" IS '탈퇴 사유 (드롭다운 선택값)';
COMMENT ON COLUMN "account_deletions"."feedback" IS '추가 피드백 (선택사항)';
COMMENT ON COLUMN "account_deletions"."deleted_at" IS '탈퇴 시각';

