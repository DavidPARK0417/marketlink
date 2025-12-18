-- 계정 정지/해제 기능을 위한 필드 추가
-- retailers 테이블에 status, suspension_reason 필드 추가
-- wholesalers 테이블에 suspension_reason 필드 추가

-- 1. retailers 테이블에 status 필드 추가 (기본값: 'active')
ALTER TABLE retailers
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'suspended'));

COMMENT ON COLUMN retailers.status IS '소매사업자 상태: active(활성), suspended(정지)';

-- 2. retailers 테이블에 suspension_reason 필드 추가
ALTER TABLE retailers
ADD COLUMN IF NOT EXISTS suspension_reason TEXT NULL;

COMMENT ON COLUMN retailers.suspension_reason IS '계정 정지 사유 (정지된 경우에만 값 존재)';

-- 3. wholesalers 테이블에 suspension_reason 필드 추가
ALTER TABLE wholesalers
ADD COLUMN IF NOT EXISTS suspension_reason TEXT NULL;

COMMENT ON COLUMN wholesalers.suspension_reason IS '계정 정지 사유 (정지된 경우에만 값 존재)';

-- 4. 기존 retailers 데이터의 status를 'active'로 설정 (이미 DEFAULT로 설정되어 있지만 명시적으로 업데이트)
UPDATE retailers
SET status = 'active'
WHERE status IS NULL OR status = '';

