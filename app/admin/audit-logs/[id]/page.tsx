/**
 * @file app/admin/audit-logs/[id]/page.tsx
 * @description 감사 로그 상세 페이지
 *
 * 관리자가 특정 감사 로그의 상세 정보를 조회하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 감사 로그 상세 정보 조회
 * 2. profiles 테이블과 조인하여 관리자 정보 포함
 * 3. details JSONB 내용을 포맷팅하여 표시
 * 4. IP 주소 표시
 * 5. 모든 필드 정보 표시
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/admin/JsonViewer.tsx (JSON 포맷팅)
 */

import { requireAdmin } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import JsonViewer from "@/components/admin/JsonViewer";

export const dynamic = "force-dynamic";

interface AuditLogDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 액션 유형을 가독성 있게 포맷팅
 */
function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * 감사 로그 상세 정보 조회
 */
async function getAuditLogDetail(logId: string) {
  const supabase = createClerkSupabaseClient();

  // 감사 로그 정보 조회 (profiles 조인)
  const { data: log, error } = await supabase
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
    )
    .eq("id", logId)
    .single();

  if (error || !log) {
    console.error("❌ [admin/audit-logs] 감사 로그 조회 오류:", error);
    return null;
  }

  return log as {
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
    }[];
  };
}

export default async function AuditLogDetailPage({
  params,
}: AuditLogDetailPageProps) {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin/audit-logs] 감사 로그 상세 페이지 접근", {
    email: profile.email,
    role: profile.role,
  });

  // params 파싱
  const { id: logId } = await params;

  // 감사 로그 상세 정보 조회
  const log = await getAuditLogDetail(logId);

  if (!log) {
    console.error("❌ [admin/audit-logs] 감사 로그를 찾을 수 없음:", logId);
    notFound();
  }

  const adminEmail = log.profiles[0]?.email || "-";
  const formattedDate = format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss", {
    locale: ko,
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/audit-logs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">감사 로그 상세</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              생성일: {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {/* 감사 로그 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>감사 로그의 기본 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">관리자:</span>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{adminEmail}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">액션:</span>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {formatAction(log.action)}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">대상 타입:</span>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {log.target_type || "-"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">대상 ID:</span>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 font-mono">
                {log.target_id || "-"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IP 주소:</span>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 font-mono">
                {log.ip_address || "-"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">생성일시:</span>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{formattedDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상세 정보 (JSON) */}
      {log.details && (
        <Card>
          <CardHeader>
            <CardTitle>상세 정보</CardTitle>
            <CardDescription>
              액션에 대한 추가 정보입니다. JSON 형식으로 표시됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JsonViewer data={log.details} />
          </CardContent>
        </Card>
      )}

      {/* 상세 정보가 없는 경우 */}
      {!log.details && (
        <Card>
          <CardHeader>
            <CardTitle>상세 정보</CardTitle>
            <CardDescription>
              이 액션에는 추가 상세 정보가 없습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">상세 정보 없음</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

