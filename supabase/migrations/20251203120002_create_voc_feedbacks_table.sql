-- ============================================
-- VOC Feedbacks 테이블 생성
-- ============================================
-- 
-- 고객의 소리(VOC - Voice of Customer) 피드백을 저장하는 테이블입니다.
-- 도매사업자가 제출한 피드백을 관리자가 확인할 수 있습니다.
-- 
-- 구조:
-- - id: 피드백 고유 ID
-- - profile_id: 제출한 사용자의 profile ID (profiles 테이블 참조)
-- - title: 제목
-- - content: 내용
-- - created_at: 제출 시간
-- 
-- 참고:
-- - RLS는 개발 중 비활성화 (프로덕션에서는 활성화 필요)
-- ============================================

CREATE TABLE IF NOT EXISTS public.voc_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_voc_feedbacks_profile_id ON public.voc_feedbacks(profile_id);
CREATE INDEX IF NOT EXISTS idx_voc_feedbacks_created_at ON public.voc_feedbacks(created_at DESC);

-- 코멘트 추가
COMMENT ON TABLE public.voc_feedbacks IS '고객의 소리(VOC) 피드백 테이블';
COMMENT ON COLUMN public.voc_feedbacks.profile_id IS '제출한 사용자의 profile ID';
COMMENT ON COLUMN public.voc_feedbacks.title IS '피드백 제목';
COMMENT ON COLUMN public.voc_feedbacks.content IS '피드백 내용';
COMMENT ON COLUMN public.voc_feedbacks.created_at IS '제출 시간';

