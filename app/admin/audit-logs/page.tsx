/**
 * @file app/admin/audit-logs/page.tsx
 * @description 관리자 감사 로그 조회 페이지
 *
 * 관리자가 모든 관리자 액션을 추적하고 조회하는 페이지입니다.
 * 관리자만 접근할 수 있으며, 모든 감사 로그를 조회하고 필터링할 수 있습니다.
 *
 * 주요 기능:
 * 1. 관리자 권한 체크 (requireAdmin)
 * 2. audit_logs 테이블에서 모든 로그 조회
 * 3. profiles 테이블과 조인하여 관리자 정보 포함
 * 4. 액션 유형 필터 (wholesaler_approve, account_suspend 등)
 * 5. 날짜 범위 필터
 * 6. 관리자 필터 (user_id)
 * 7. 페이지네이션 (20개씩)
 * 8. 테이블 형태로 표시
 * 9. 각 행 클릭 시 상세 페이지로 이동
 * 10. 정렬: created_at DESC
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/admin/AuditLogFilter.tsx
 * - components/admin/AuditLogTableRow.tsx
 * - components/common/EmptyState.tsx
 */

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";
import AuditLogFilter from "@/components/admin/AuditLogFilter";
import AuditLogTableRow from "@/components/admin/AuditLogTableRow";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface AuditLogWithProfile {
  id: string;
  user_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  profiles: {
    id: string;
    email: string;
  };
}

interface AuditLogsPageProps {
  searchParams: Promise<{
    page?: string;
    action?: string;
    date_from?: string;
    date_to?: string;
    user_id?: string;
  }>;
}

/**
 * 액션 유형을 가독성 있게 포맷팅
 */
function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin] 감사 로그 페이지 접근", {
    email: profile.email,
    role: profile.role,
  });

  // URL 쿼리 파라미터 파싱
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const actionFilter = params.action;
  const dateFrom = params.date_from;
  const dateTo = params.date_to;
  const userIdFilter = params.user_id;

  console.log("🔍 [admin] 감사 로그 필터:", {
    page,
    action: actionFilter,
    dateFrom,
    dateTo,
    userId: userIdFilter,
  });

  // Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  // 페이지네이션 설정
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 감사 로그 목록 조회
  // profiles 테이블과 조인하여 관리자 정보 포함
  let query = supabase
    .from("audit_logs")
    .select(
      `
      id,
      user_id,
      action,
      target_type,
      target_id,
      details,
      ip_address,
      created_at,
      profiles!inner (
        id,
        email
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  // 액션 필터 적용
  if (actionFilter) {
    query = query.eq("action", actionFilter);
  }

  // 날짜 범위 필터 적용
  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }
  if (dateTo) {
    // 날짜 끝까지 포함하기 위해 23:59:59 추가
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);
    query = query.lte("created_at", endDate.toISOString());
  }

  // 관리자 필터 적용
  if (userIdFilter) {
    query = query.eq("user_id", userIdFilter);
  }

  const { data: auditLogs, error, count } = await query;

  if (error) {
    console.error("❌ [admin] 감사 로그 목록 조회 오류:", error);
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  console.log("📊 [admin] 감사 로그 수:", {
    current: auditLogs?.length ?? 0,
    total,
    page,
    totalPages,
  });

  // 타입 안전성을 위해 타입 단언
  const logs = (auditLogs as unknown as AuditLogWithProfile[]) ?? [];

  // 관리자 목록 조회 (필터용)
  const { data: adminProfiles } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("role", "admin")
    .order("email", { ascending: true });

  const admins = adminProfiles ?? [];

  // 고유한 액션 유형 목록 조회 (필터용)
  const { data: actionTypes } = await supabase
    .from("audit_logs")
    .select("action")
    .order("action", { ascending: true });

  const uniqueActions = Array.from(
    new Set((actionTypes ?? []).map((item) => item.action)),
  ).sort();

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">감사 로그</h1>
        <p className="text-sm text-muted-foreground mt-1">
          모든 관리자 액션을 추적하고 조회합니다. 액션 유형, 날짜 범위, 관리자별로
          필터링할 수 있습니다.
        </p>
      </div>

      {/* 필터 영역 */}
      <AuditLogFilter
        currentAction={actionFilter}
        currentDateFrom={dateFrom}
        currentDateTo={dateTo}
        currentUserId={userIdFilter}
        actions={uniqueActions}
        admins={admins}
      />

      {/* 테이블 영역 */}
      {logs.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대상 타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대상 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP 주소
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜/시간
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => {
                  const profileData =
                    typeof log.profiles === "object" &&
                    log.profiles !== null &&
                    "email" in log.profiles
                      ? (log.profiles as { id: string; email: string })
                      : null;

                  return (
                    <AuditLogTableRow
                      key={log.id}
                      id={log.id}
                      adminEmail={profileData?.email || "-"}
                      action={log.action}
                      targetType={log.target_type}
                      targetId={log.target_id}
                      ipAddress={log.ip_address}
                      createdAt={log.created_at}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                총 {total}개 중 {from + 1}-
                {Math.min(to + 1, total)}개 표시
              </div>
              <div className="flex gap-2">
                <Link
                  href={{
                    pathname: "/admin/audit-logs",
                    query: {
                      ...(actionFilter && { action: actionFilter }),
                      ...(dateFrom && { date_from: dateFrom }),
                      ...(dateTo && { date_to: dateTo }),
                      ...(userIdFilter && { user_id: userIdFilter }),
                      page: page > 1 ? page - 1 : 1,
                    },
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    이전
                  </Button>
                </Link>
                <div className="flex items-center px-4 text-sm text-gray-600">
                  {page} / {totalPages}
                </div>
                <Link
                  href={{
                    pathname: "/admin/audit-logs",
                    query: {
                      ...(actionFilter && { action: actionFilter }),
                      ...(dateFrom && { date_from: dateFrom }),
                      ...(dateTo && { date_to: dateTo }),
                      ...(userIdFilter && { user_id: userIdFilter }),
                      page: page < totalPages ? page + 1 : totalPages,
                    },
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                  >
                    다음
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        // 빈 목록 처리
        <Card>
          <CardContent className="p-12">
            <EmptyState
              message="감사 로그가 없습니다"
              description={
                actionFilter || dateFrom || dateTo || userIdFilter
                  ? "선택한 필터 조건에 맞는 감사 로그가 없습니다. 필터를 변경해보세요."
                  : "현재 등록된 감사 로그가 없습니다. 관리자 액션이 발생하면 여기에 표시됩니다."
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

