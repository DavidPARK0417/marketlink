-- 관리자가 product-images 버킷에 이미지를 업로드할 수 있도록 정책 추가
-- 관리자는 모든 폴더에 업로드/삭제/업데이트 가능

-- 기존 정책 삭제 (이미 존재하는 경우 대비)
DROP POLICY IF EXISTS "Admins can upload to any folder" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update any files" ON storage.objects;

-- INSERT: 관리자도 모든 폴더에 업로드 가능
CREATE POLICY "Admins can upload to any folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  is_admin()
);

-- DELETE: 관리자도 모든 파일 삭제 가능
CREATE POLICY "Admins can delete any files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  is_admin()
);

-- UPDATE: 관리자도 모든 파일 업데이트 가능
CREATE POLICY "Admins can update any files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  is_admin()
)
WITH CHECK (
  bucket_id = 'product-images' AND
  is_admin()
);

