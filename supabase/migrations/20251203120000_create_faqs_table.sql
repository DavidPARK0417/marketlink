-- ============================================
-- FAQs 테이블 생성
-- ============================================
-- 
-- 자주 묻는 질문(FAQ)을 관리하는 테이블입니다.
-- 관리자가 직접 추가/수정/삭제할 수 있습니다.
-- 
-- 구조:
-- - id: FAQ 고유 ID
-- - question: 질문 내용
-- - answer: 답변 내용
-- - display_order: 표시 순서 (작은 숫자가 먼저 표시됨)
-- - created_at: 생성 시간
-- - updated_at: 수정 시간
-- ============================================

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON public.faqs(display_order);
CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON public.faqs(created_at);

-- 코멘트 추가
COMMENT ON TABLE public.faqs IS '자주 묻는 질문(FAQ) 테이블';
COMMENT ON COLUMN public.faqs.question IS '질문 내용';
COMMENT ON COLUMN public.faqs.answer IS '답변 내용';
COMMENT ON COLUMN public.faqs.display_order IS '표시 순서 (작은 숫자가 먼저 표시됨)';
COMMENT ON COLUMN public.faqs.created_at IS '생성 시간';
COMMENT ON COLUMN public.faqs.updated_at IS '수정 시간';

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faqs_updated_at();

