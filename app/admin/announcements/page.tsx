/**
 * @file app/admin/announcements/page.tsx
 * @description 공지사항 관리 페이지
 *
 * 관리자가 공지사항을 관리하는 페이지입니다.
 * 공지사항 목록을 표시하고, 생성, 수정, 삭제 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 공지사항 목록 표시 (최신순)
 * 2. 공지사항 생성
 * 3. 공지사항 수정
 * 4. 공지사항 삭제
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - actions/admin/announcements.ts
 */

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import AnnouncementManagementClient from "@/components/admin/AnnouncementManagementClient";
import type { Announcement } from "@/types/announcement";

export const dynamic = "force-dynamic";

interface AdminAnnouncementsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default async function AdminAnnouncementsPage({
  searchParams,
}: AdminAnnouncementsPageProps) {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin/announcements] 관리자 권한 확인됨", {
    email: profile.email,
    role: profile.role,
  });

  // 쿼리 파라미터 파싱
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = parseInt(params.pageSize ?? "20", 10);

  // 공지사항 목록 조회 (페이지네이션 적용)
  const supabase = await createClerkSupabaseClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: announcements, error, count } = await supabase
    .from("announcements")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("❌ [admin/announcements] 공지사항 목록 조회 오류:", error);
  }

  const typedAnnouncements = (announcements || []) as Announcement[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">공지사항 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          공지사항을 작성하고 관리합니다. 추가, 수정, 삭제할 수 있습니다.
        </p>
      </div>

      {/* 공지사항 관리 클라이언트 컴포넌트 */}
      <AnnouncementManagementClient
        initialAnnouncements={typedAnnouncements}
        initialPage={page}
        initialPageSize={pageSize}
        total={total}
        totalPages={totalPages}
      />
    </div>
  );
}

