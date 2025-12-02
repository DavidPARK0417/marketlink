-- ============================================
-- inquiry_messages 테이블 생성
-- ============================================
-- 
-- 목적: 문의 대화 히스토리를 저장하기 위한 테이블
-- 문의자와 관리자/도매사업자 간의 대화를 시간순으로 저장
-- 
-- 구조:
-- - inquiry_id: 문의 ID (inquiries 테이블 참조)
-- - sender_type: 발신자 타입 ('user', 'admin', 'wholesaler')
-- - sender_id: 발신자 ID (profiles 테이블 참조, nullable)
-- - content: 메시지 내용
-- - created_at: 생성 시간
-- 
-- 참고:
-- - CS 시스템(cs_threads + cs_messages)과 유사한 구조
-- - 문의자가 추가 질문을 할 수 있도록 지원
-- ============================================

-- inquiry_messages 테이블 생성
CREATE TABLE IF NOT EXISTS public.inquiry_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'wholesaler')),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- COMMENT 추가
COMMENT ON TABLE public.inquiry_messages IS '문의 대화 히스토리 테이블';
COMMENT ON COLUMN public.inquiry_messages.inquiry_id IS '문의 ID (inquiries 테이블 참조)';
COMMENT ON COLUMN public.inquiry_messages.sender_type IS '발신자 타입: user (문의자), admin (관리자), wholesaler (도매사업자)';
COMMENT ON COLUMN public.inquiry_messages.sender_id IS '발신자 ID (profiles 테이블 참조, nullable)';
COMMENT ON COLUMN public.inquiry_messages.content IS '메시지 내용';
COMMENT ON COLUMN public.inquiry_messages.created_at IS '생성 시간';

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry_id 
ON public.inquiry_messages(inquiry_id);

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_created_at 
ON public.inquiry_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry_created 
ON public.inquiry_messages(inquiry_id, created_at);

-- 기존 데이터 마이그레이션 (선택사항)
-- inquiries 테이블에 admin_reply가 있는 경우 inquiry_messages로 마이그레이션
DO $$
DECLARE
  inquiry_record RECORD;
BEGIN
  -- 초기 문의 내용을 메시지로 변환
  FOR inquiry_record IN 
    SELECT id, user_id, content, admin_reply, created_at, replied_at
    FROM public.inquiries
    WHERE content IS NOT NULL
  LOOP
    -- 초기 문의 내용이 inquiry_messages에 없으면 추가
    IF NOT EXISTS (
      SELECT 1 FROM public.inquiry_messages 
      WHERE inquiry_id = inquiry_record.id 
      AND sender_type = 'user'
      ORDER BY created_at ASC
      LIMIT 1
    ) THEN
      INSERT INTO public.inquiry_messages (inquiry_id, sender_type, sender_id, content, created_at)
      VALUES (
        inquiry_record.id,
        'user',
        inquiry_record.user_id,
        inquiry_record.content,
        inquiry_record.created_at
      );
    END IF;

    -- 기존 답변이 있으면 메시지로 변환
    IF inquiry_record.admin_reply IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.inquiry_messages 
      WHERE inquiry_id = inquiry_record.id 
      AND sender_type IN ('admin', 'wholesaler')
      ORDER BY created_at ASC
      LIMIT 1
    ) THEN
      INSERT INTO public.inquiry_messages (inquiry_id, sender_type, sender_id, content, created_at)
      VALUES (
        inquiry_record.id,
        CASE 
          WHEN inquiry_record.id IN (
            SELECT id FROM public.inquiries 
            WHERE inquiry_type = 'retailer_to_wholesaler'
          ) THEN 'wholesaler'
          ELSE 'admin'
        END,
        NULL, -- sender_id는 기존 데이터에서 알 수 없으므로 NULL
        inquiry_record.admin_reply,
        COALESCE(inquiry_record.replied_at, inquiry_record.created_at)
      );
    END IF;
  END LOOP;
END $$;

