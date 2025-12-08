/**
 * @file app/admin/voc/page.tsx
 * @description VOC 확인 페이지
 *
 * 관리자가 고객의 소리(VOC) 피드백을 확인하는 페이지입니다.
 *
 * 주요 기능:
 * 1. VOC 피드백 목록 조회
 * 2. 검색 및 필터링
 * 3. 피드백 상세 확인
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - actions/admin/voc.ts
 */

import { requireAdmin } from "@/lib/clerk/auth";
import VOCManagementClient from "@/components/admin/VOCManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminVOCPage() {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin/voc] 관리자 권한 확인됨", {
    email: profile.email,
    role: profile.role,
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">고객의 소리(VOC)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          도매사업자들이 제출한 피드백을 확인할 수 있습니다.
        </p>
      </div>

      {/* VOC 관리 클라이언트 컴포넌트 */}
      <VOCManagementClient />
    </div>
  );
}

