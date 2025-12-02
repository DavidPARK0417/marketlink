/**
 * @file app/admin/cs/page.tsx
 * @description 관리자 CS 통합 관리 페이지
 *
 * 관리자가 도매와 소매의 CS를 통합 관리하는 페이지입니다.
 * 관리자만 접근할 수 있으며, 모든 CS 스레드를 조회하고 필터링할 수 있습니다.
 *
 * 주요 기능:
 * 1. 관리자 권한 체크 (requireAdmin)
 * 2. cs_threads 테이블에서 모든 스레드 조회
 * 3. profiles 테이블과 조인하여 사용자 정보 포함
 * 4. 상태별 필터 (open, bot_handled, escalated, closed)
 * 5. 역할별 필터 (wholesaler, retailer)
 * 6. 테이블 형태로 표시 (제목, 사용자, 상태, 생성일)
 * 7. 각 행 클릭 시 상세 페이지로 이동
 * 8. 정렬: created_at DESC
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/admin/CSTableRow.tsx
 * - components/common/EmptyState.tsx
 */

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import CSTableRow from "@/components/admin/CSTableRow";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";
import CSFilter from "@/components/admin/CSFilter";
import type { CsThreadStatus } from "@/types/database";

export const dynamic = "force-dynamic";

interface CSThreadWithProfile {
  id: string;
  title: string;
  status: CsThreadStatus;
  created_at: string;
  closed_at: string | null;
  profiles: {
    email: string;
    role: "wholesaler" | "retailer" | "admin" | null;
  };
}

interface CSPageProps {
  searchParams: Promise<{
    status?: string;
    role?: string;
  }>;
}

export default async function AdminCSPage({ searchParams }: CSPageProps) {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin] CS 통합 관리 페이지 접근", {
    email: profile.email,
    role: profile.role,
  });

  // URL 쿼리 파라미터 파싱
  const params = await searchParams;
  const statusFilter = params.status as CsThreadStatus | undefined;
  const roleFilter = params.role as "wholesaler" | "retailer" | undefined;

  console.log("🔍 [admin] CS 필터:", {
    status: statusFilter,
    role: roleFilter,
  });

  // Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  // CS 스레드 목록 조회
  // profiles 테이블과 조인하여 사용자 정보 포함
  let query = supabase
    .from("cs_threads")
    .select(
      `
      id,
      title,
      status,
      created_at,
      closed_at,
      profiles!inner (
        email,
        role
      )
    `,
    )
    .order("created_at", { ascending: false });

  // 상태 필터 적용
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: csThreads, error } = await query;

  // 역할 필터 적용 (클라이언트 사이드 필터링)
  // Supabase는 조인된 테이블의 필드로 직접 필터링을 지원하지 않으므로
  // 데이터를 가져온 후 JavaScript에서 필터링
  let filteredThreads = csThreads || [];
  if (roleFilter) {
    filteredThreads = filteredThreads.filter((thread: any) => {
      const profile = thread.profiles;
      if (Array.isArray(profile)) {
        return profile.some((p: any) => p.role === roleFilter);
      }
      return profile?.role === roleFilter;
    });
  }

  if (error) {
    console.error("❌ [admin] CS 스레드 목록 조회 오류:", error);
  }

  console.log("📊 [admin] CS 스레드 수:", filteredThreads.length);

  // 타입 안전성을 위해 타입 단언
  const threads = filteredThreads as unknown as CSThreadWithProfile[];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CS 통합 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          도매와 소매의 모든 CS 문의를 통합 관리합니다. 상태와 역할별로 필터링할
          수 있습니다.
        </p>
      </div>

      {/* 필터 영역 */}
      <CSFilter currentStatus={statusFilter} currentRole={roleFilter} />

      {/* 테이블 영역 */}
      {threads.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {threads.map((thread) => {
                  const profileData =
                    typeof thread.profiles === "object" &&
                    thread.profiles !== null &&
                    "email" in thread.profiles
                      ? (thread.profiles as { email: string; role: string | null })
                      : null;

                  return (
                    <CSTableRow
                      key={thread.id}
                      id={thread.id}
                      title={thread.title}
                      email={profileData?.email || "-"}
                      role={profileData?.role || null}
                      status={thread.status}
                      created_at={thread.created_at}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // 빈 목록 처리
        <Card>
          <CardContent className="p-12">
            <EmptyState
              message="CS 문의가 없습니다"
              description={
                statusFilter || roleFilter
                  ? "선택한 필터 조건에 맞는 CS 문의가 없습니다. 필터를 변경해보세요."
                  : "현재 등록된 CS 문의가 없습니다. 새로운 문의가 들어오면 여기에 표시됩니다."
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

