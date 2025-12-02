/**
 * @file app/admin/cs/[id]/page.tsx
 * @description CS 상세 및 답변 페이지
 *
 * 관리자가 CS 문의의 상세 정보를 확인하고 답변을 작성하는 페이지입니다.
 *
 * 주요 기능:
 * 1. CS 스레드 정보 조회
 * 2. cs_messages 테이블에서 대화 이력 조회
 * 3. 사용자/봇/관리자 메시지 구분 표시
 * 4. 관리자 답변 작성 폼
 * 5. 티켓 상태 변경 (answered, closed)
 * 6. 에러 처리
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - components/admin/CSMessageList.tsx
 * - components/admin/CSReplyForm.tsx
 * - components/admin/CSStatusBadge.tsx
 * - actions/admin/cs-reply.ts (replyToCS, closeCSThread)
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
import CSMessageList from "@/components/admin/CSMessageList";
import CSReplyForm from "@/components/admin/CSReplyForm";
import CSStatusBadge from "@/components/admin/CSStatusBadge";
import CloseThreadButton from "@/components/admin/CloseThreadButton";
import type { CsThread, CsMessage, CsThreadStatus } from "@/types/database";

export const dynamic = "force-dynamic";

interface CSDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * CS 스레드 상세 정보 조회
 */
async function getCSThreadDetail(threadId: string) {
  const supabase = createClerkSupabaseClient();

  // CS 스레드 정보 조회 (profiles 조인)
  const { data: thread, error: threadError } = await supabase
    .from("cs_threads")
    .select(
      `
      id,
      title,
      status,
      created_at,
      closed_at,
      updated_at,
      profiles!inner (
        id,
        email,
        role
      )
    `,
    )
    .eq("id", threadId)
    .single();

  if (threadError || !thread) {
    console.error("❌ [admin/cs] CS 스레드 조회 오류:", threadError);
    return null;
  }

  // cs_messages 조회 (시간순 정렬)
  const { data: messages, error: messagesError } = await supabase
    .from("cs_messages")
    .select("*")
    .eq("cs_thread_id", threadId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("❌ [admin/cs] 메시지 조회 오류:", messagesError);
  }

  return {
    thread: thread as unknown as CsThread & {
      profiles: { email: string; role: string | null };
    },
    messages: (messages || []) as CsMessage[],
  };
}


export default async function CSDetailPage({ params }: CSDetailPageProps) {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin/cs] CS 상세 페이지 접근", {
    email: profile.email,
    role: profile.role,
  });

  // params 파싱
  const { id: threadId } = await params;

  // CS 스레드 상세 정보 조회
  const data = await getCSThreadDetail(threadId);

  if (!data) {
    console.error("❌ [admin/cs] CS 스레드를 찾을 수 없음:", threadId);
    notFound();
  }

  const { thread, messages } = data;
  const userEmail = thread.profiles?.email || "-";

  // 날짜 포맷팅
  const formattedCreatedAt = format(
    new Date(thread.created_at),
    "yyyy-MM-dd HH:mm",
    { locale: ko },
  );

  const formattedClosedAt = thread.closed_at
    ? format(new Date(thread.closed_at), "yyyy-MM-dd HH:mm", { locale: ko })
    : null;

  // 답변 작성 가능 여부 (status가 'open', 'bot_handled', 'escalated'인 경우)
  const canReply =
    thread.status === "open" ||
    thread.status === "bot_handled" ||
    thread.status === "escalated";

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              생성일: {formattedCreatedAt}
              {formattedClosedAt && ` | 종료일: ${formattedClosedAt}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CSStatusBadge status={thread.status} />
        </div>
      </div>

      {/* CS 스레드 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>CS 문의 정보</CardTitle>
          <CardDescription>
            사용자: {userEmail} ({thread.profiles?.role || "알 수 없음"})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">제목:</span>
              <p className="text-sm text-gray-900 mt-1">{thread.title}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">상태:</span>
              <div className="mt-1">
                <CSStatusBadge status={thread.status} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 대화 이력 */}
      <Card>
        <CardHeader>
          <CardTitle>대화 이력</CardTitle>
          <CardDescription>
            총 {messages.length}개의 메시지
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CSMessageList messages={messages} userEmail={userEmail} />
        </CardContent>
      </Card>

      {/* 관리자 답변 폼 (답변 가능한 경우만) */}
      {canReply && (
        <Card>
          <CardHeader>
            <CardTitle>답변 작성</CardTitle>
            <CardDescription>
              CS 문의에 대한 답변을 작성해주세요. 답변 작성 후 상태가
              &quot;답변완료&quot;로 변경됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CSReplyForm threadId={threadId} />
          </CardContent>
        </Card>
      )}

      {/* 티켓 종료 버튼 (답변 완료된 경우 또는 답변 불가능한 경우) */}
      {!canReply && thread.status !== "closed" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <CloseThreadButton threadId={threadId} currentStatus={thread.status} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이미 답변 완료된 경우 안내 */}
      {thread.status === "answered" && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                답변이 완료되었습니다. 필요시 티켓을 종료할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이미 종료된 경우 안내 */}
      {thread.status === "closed" && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                이 티켓은 이미 종료되었습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

