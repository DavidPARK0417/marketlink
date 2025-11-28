-- ============================================
-- inquiries 테이블에 첨부 이미지 필드 추가
-- ============================================
-- 
-- 목적: 도매사업자가 관리자에게 문의할 때 이미지를 첨부할 수 있도록 함
-- 
-- 추가 필드:
-- 1. attachment_urls: 첨부 이미지 URL 배열 (TEXT[])
-- 
-- 참고:
-- - 최대 5개까지 첨부 가능
-- - 개별 파일 크기 제한: 5MB
-- - Storage 버킷: product-images (public)
-- - 경로 구조: {clerk_user_id}/inquiries/{timestamp}-{filename}
-- ============================================

-- attachment_urls 필드 추가
ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS attachment_urls TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.inquiries.attachment_urls IS 
  '문의 첨부 이미지 URL 배열 (최대 5개). product-images 버킷의 Public URL 저장';

