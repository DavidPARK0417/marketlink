-- 관리자 Storage 업로드 문제 해결
-- 도매점 정책에 관리자도 포함하도록 수정

-- 기존 도매점 정책 삭제
DROP POLICY IF EXISTS "Wholesalers can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Wholesalers can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Wholesalers can update own files" ON storage.objects;

-- INSERT: 도매점은 자신의 폴더에, 관리자는 모든 폴더에 업로드 가능
CREATE POLICY "Wholesalers and admins can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (
    -- 도매점: 자신의 폴더에만 업로드
    (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
    OR
    -- 관리자: 모든 폴더에 업로드 가능
    is_admin()
  )
);

-- DELETE: 도매점은 자신의 파일만, 관리자는 모든 파일 삭제 가능
CREATE POLICY "Wholesalers and admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (
    -- 도매점: 자신의 파일만 삭제
    (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
    OR
    -- 관리자: 모든 파일 삭제 가능
    is_admin()
  )
);

-- UPDATE: 도매점은 자신의 파일만, 관리자는 모든 파일 업데이트 가능
CREATE POLICY "Wholesalers and admins can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (
    -- 도매점: 자신의 파일만 업데이트
    (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
    OR
    -- 관리자: 모든 파일 업데이트 가능
    is_admin()
  )
)
WITH CHECK (
  bucket_id = 'product-images' AND
  (
    -- 도매점: 자신의 파일만 업데이트
    (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
    OR
    -- 관리자: 모든 파일 업데이트 가능
    is_admin()
  )
);

