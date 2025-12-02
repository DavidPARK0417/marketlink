-- CS 스레드 상태에 'answered' 값 추가
-- 관리자가 답변을 작성했을 때 상태를 'answered'로 변경할 수 있도록 함

-- 기존 CHECK 제약 조건 제거 (존재하는 경우)
ALTER TABLE cs_threads 
DROP CONSTRAINT IF EXISTS cs_threads_status_check;

-- 새로운 CHECK 제약 조건 추가 (answered 포함)
ALTER TABLE cs_threads 
ADD CONSTRAINT cs_threads_status_check 
CHECK (status IN ('open', 'bot_handled', 'escalated', 'answered', 'closed'));

-- COMMENT 업데이트
COMMENT ON COLUMN cs_threads.status IS 'open, bot_handled, escalated, answered, closed';

