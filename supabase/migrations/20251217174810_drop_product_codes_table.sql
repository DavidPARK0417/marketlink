-- product_codes 테이블 및 관련 인덱스 삭제
-- 이 테이블은 시세조회에서 사용되지 않으며, KAMIS API를 직접 사용하므로 삭제합니다.

DROP TABLE IF EXISTS product_codes CASCADE;

