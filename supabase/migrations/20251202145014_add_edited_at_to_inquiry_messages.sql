-- ============================================
-- inquiry_messages 테이블에 수정 시간 필드 추가
-- ============================================
-- 
-- 목적: 메시지 수정 이력을 추적하기 위한 필드 추가
-- edited_at이 null이면 수정되지 않은 메시지, 값이 있으면 수정된 메시지
-- ============================================

-- inquiry_messages 테이블에 수정 시간 필드 추가
ALTER TABLE public.inquiry_messages
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- COMMENT 추가
COMMENT ON COLUMN public.inquiry_messages.edited_at IS '수정 시간 (null이면 수정되지 않음)';

