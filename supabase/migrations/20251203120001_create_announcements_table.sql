-- ============================================
-- Announcements 테이블 생성
-- ============================================
-- 
-- 공지사항을 관리하는 테이블입니다.
-- 관리자가 직접 작성/수정/삭제할 수 있습니다.
-- 
-- 구조:
-- - id: 공지사항 고유 ID
-- - title: 제목
-- - content: 내용
-- - created_at: 생성 시간
-- - updated_at: 수정 시간
-- 
-- 참고:
-- - "NEW" 라벨은 7일 이내 작성된 공지사항에 표시 (애플리케이션 레벨에서 처리)
-- ============================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_updated_at ON public.announcements(updated_at DESC);

-- 코멘트 추가
COMMENT ON TABLE public.announcements IS '공지사항 테이블';
COMMENT ON COLUMN public.announcements.title IS '공지사항 제목';
COMMENT ON COLUMN public.announcements.content IS '공지사항 내용';
COMMENT ON COLUMN public.announcements.created_at IS '생성 시간';
COMMENT ON COLUMN public.announcements.updated_at IS '수정 시간';

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

