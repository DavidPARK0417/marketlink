-- ============================================
-- retailers 테이블에 anonymous_code 필드 추가
-- ============================================
-- 
-- 목적: 소매점 익명 코드 추가 (도매점에게 노출용)
-- 형식: R-001, R-002, R-003 (3자리 숫자 패딩)
-- 
-- 참고:
-- - wholesalers의 anonymous_code (VENDOR-001)와 유사한 패턴
-- - 도매점은 소매점의 실명/연락처를 볼 수 없고, anonymous_code만 표시
-- - UNIQUE 제약조건으로 중복 방지
-- ============================================

-- anonymous_code 필드 추가
ALTER TABLE public.retailers
ADD COLUMN IF NOT EXISTS anonymous_code TEXT UNIQUE;

COMMENT ON COLUMN public.retailers.anonymous_code IS 
  '소매점 익명 코드 (도매점에게 노출용, 예: R-001)';

-- 기존 데이터에 대한 anonymous_code 자동 생성 (NULL인 경우만)
-- 기존 retailers 레코드가 있다면 순차적으로 코드 부여
DO $$
DECLARE
  retailer_record RECORD;
  next_number INTEGER := 1;
  max_code TEXT;
  code_match TEXT[];
BEGIN
  -- 최대 anonymous_code 조회 (R-XXX 형식만)
  SELECT anonymous_code INTO max_code
  FROM public.retailers
  WHERE anonymous_code ~ '^R-\d+$'
  ORDER BY anonymous_code DESC
  LIMIT 1;

  -- 기존 코드에서 숫자 추출
  IF max_code IS NOT NULL THEN
    code_match := regexp_match(max_code, 'R-(\d+)');
    IF code_match[1] IS NOT NULL THEN
      next_number := CAST(code_match[1] AS INTEGER) + 1;
    END IF;
  END IF;

  -- anonymous_code가 NULL인 기존 레코드에 코드 부여
  FOR retailer_record IN 
    SELECT id FROM public.retailers 
    WHERE anonymous_code IS NULL OR anonymous_code = ''
    ORDER BY created_at ASC
  LOOP
    UPDATE public.retailers
    SET anonymous_code = 'R-' || LPAD(next_number::TEXT, 3, '0')
    WHERE id = retailer_record.id;
    
    next_number := next_number + 1;
  END LOOP;
END $$;

-- ============================================
-- retailers용 anonymous_code 자동 생성 트리거
-- ============================================
-- 
-- 목적: retailers 테이블에 INSERT 시 anonymous_code를 자동으로 생성
-- 형식: R-001, R-002, R-003 (3자리 숫자 패딩)
-- 
-- 동작 방식:
-- 1. anonymous_code가 NULL이거나 빈 문자열일 때만 생성
-- 2. 이미 값이 있으면 덮어쓰지 않음
-- 3. 기존 최대값을 조회하여 +1 증가
-- 4. 동시성 안전을 위해 advisory lock 사용
-- ============================================

-- retailers용 anonymous_code 자동 생성 함수
CREATE OR REPLACE FUNCTION public.generate_retailer_anonymous_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  max_code TEXT;
  next_number INTEGER := 1;
  code_match TEXT[];
  lock_id BIGINT := 123457; -- advisory lock ID (wholesalers와 다른 값 사용)
BEGIN
  -- anonymous_code가 이미 있으면 그대로 유지
  IF NEW.anonymous_code IS NOT NULL AND NEW.anonymous_code != '' THEN
    RETURN NEW;
  END IF;

  -- 동시성 안전을 위해 advisory lock 사용
  -- 같은 lock_id를 사용하는 다른 트랜잭션은 대기함
  PERFORM pg_advisory_xact_lock(lock_id);

  -- 최대 anonymous_code 조회 (R-XXX 형식만)
  SELECT anonymous_code INTO max_code
  FROM public.retailers
  WHERE anonymous_code ~ '^R-\d+$'
  ORDER BY anonymous_code DESC
  LIMIT 1;

  -- 기존 코드에서 숫자 추출
  IF max_code IS NOT NULL THEN
    code_match := regexp_match(max_code, 'R-(\d+)');
    IF code_match[1] IS NOT NULL THEN
      next_number := CAST(code_match[1] AS INTEGER) + 1;
    END IF;
  END IF;

  -- 새 코드 생성 (3자리 패딩)
  NEW.anonymous_code := 'R-' || LPAD(next_number::TEXT, 3, '0');

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.generate_retailer_anonymous_code() IS 
  'retailers 테이블 INSERT 시 anonymous_code를 자동 생성하는 트리거 함수. R-001 형식으로 순차 생성.';

-- 트리거 생성
DROP TRIGGER IF EXISTS trg_generate_retailer_anonymous_code ON public.retailers;

CREATE TRIGGER trg_generate_retailer_anonymous_code
BEFORE INSERT ON public.retailers
FOR EACH ROW
EXECUTE FUNCTION public.generate_retailer_anonymous_code();

COMMENT ON TRIGGER trg_generate_retailer_anonymous_code ON public.retailers IS 
  'retailers 테이블 INSERT 전에 anonymous_code를 자동 생성하는 트리거.';

