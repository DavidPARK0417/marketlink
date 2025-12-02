/**
 * @file actions/admin/cs-reply.ts
 * @description CS 답변 및 티켓 종료 Server Action
 *
 * 관리자가 CS 문의에 답변을 작성하거나 티켓을 종료하는 Server Action입니다.
 * 답변 작성 시 cs_messages 테이블에 메시지를 삽입하고, 티켓 상태를 업데이트합니다.
 * 모든 액션은 감사 로그에 기록됩니다.
 *
 * 주요 기능:
 * 1. CS 답변 작성 (replyToCS)
 *    - cs_messages 테이블에 답변 삽입
 *    - cs_threads.status를 'answered'로 업데이트
 *    - audit_logs에 기록
 * 2. CS 티켓 종료 (closeCSThread)
 *    - cs_threads.status를 'closed'로 업데이트
 *    - closed_at 설정
 *    - audit_logs에 기록
 *
 * @dependencies
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - lib/clerk/auth.ts (requireAdmin)
 * - next/headers (headers)
 * - next/cache (revalidatePath)
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/clerk/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * IP 주소 추출
 *
 * Next.js 15에서는 headers()가 Promise를 반환합니다.
 * x-forwarded-for 또는 x-real-ip 헤더에서 IP 주소를 추출합니다.
 *
 * @returns {Promise<string>} IP 주소 (추출 실패 시 "unknown")
 */
async function getIpAddress(): Promise<string> {
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  console.log("🔍 [admin/cs-reply] IP 주소 추출:", ipAddress);
  return ipAddress;
}

/**
 * CS 답변 작성
 *
 * 관리자가 CS 문의에 답변을 작성합니다.
 * cs_messages 테이블에 답변을 삽입하고, cs_threads.status를 'answered'로 업데이트합니다.
 *
 * @param {string} threadId - CS 스레드 ID
 * @param {string} content - 답변 내용
 * @throws {Error} 답변 작성 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await replyToCS(threadId, "답변 내용입니다.");
 * ```
 */
export async function replyToCS(threadId: string, content: string) {
  try {
    console.group("📝 [admin/cs-reply] CS 답변 작성 시작");
    console.log("threadId:", threadId);
    console.log("content length:", content.length);

    // 관리자 권한 확인
    const profile = await requireAdmin();
    console.log("✅ [admin/cs-reply] 관리자 확인:", profile.email);

    // 답변 내용 유효성 검증
    if (!content || content.trim().length === 0) {
      throw new Error("답변 내용을 입력해주세요.");
    }

    if (content.trim().length < 5) {
      throw new Error("답변 내용은 최소 5자 이상 입력해주세요.");
    }

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. CS 스레드 정보 조회 (존재 여부 확인)
    const { data: thread, error: threadError } = await supabase
      .from("cs_threads")
      .select("id, status")
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      console.error("❌ [admin/cs-reply] CS 스레드 조회 오류:", threadError);
      throw new Error("CS 문의를 찾을 수 없습니다.");
    }

    console.log("✅ [admin/cs-reply] CS 스레드 확인:", thread.status);

    // 2. cs_messages 테이블에 답변 삽입
    const { data: message, error: messageError } = await supabase
      .from("cs_messages")
      .insert({
        cs_thread_id: threadId,
        sender_type: "admin",
        sender_id: profile.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (messageError) {
      console.error("❌ [admin/cs-reply] 메시지 삽입 오류:", messageError);
      throw new Error("답변을 저장하는 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin/cs-reply] 메시지 삽입 완료:", message.id);

    // 3. cs_threads.status를 'answered'로 업데이트
    const { error: updateError } = await supabase
      .from("cs_threads")
      .update({
        status: "answered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", threadId);

    if (updateError) {
      console.error("❌ [admin/cs-reply] 스레드 상태 업데이트 오류:", updateError);
      throw new Error("티켓 상태를 업데이트하는 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin/cs-reply] 스레드 상태 업데이트 완료: answered");

    // 4. 감사 로그 기록
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: profile.id,
      action: "cs_reply",
      target_type: "cs_thread",
      target_id: threadId,
      details: {
        thread_id: threadId,
        message_id: message.id,
        content_length: content.trim().length,
        previous_status: thread.status,
        new_status: "answered",
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin/cs-reply] 감사 로그 기록 오류:", logError);
      // 감사 로그 실패는 치명적이지 않으므로 계속 진행
    } else {
      console.log("✅ [admin/cs-reply] 감사 로그 기록 완료");
    }

    console.log("✅ [admin/cs-reply] CS 답변 작성 완료");
    console.groupEnd();

    // 캐시 무효화
    revalidatePath(`/admin/cs/${threadId}`);
    revalidatePath("/admin/cs");

    return { success: true, messageId: message.id };
  } catch (error) {
    console.error("❌ [admin/cs-reply] replyToCS 예외:", error);
    throw error;
  }
}

/**
 * CS 티켓 종료
 *
 * 관리자가 CS 티켓을 종료합니다.
 * cs_threads.status를 'closed'로 업데이트하고, closed_at을 설정합니다.
 *
 * @param {string} threadId - CS 스레드 ID
 * @throws {Error} 티켓 종료 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await closeCSThread(threadId);
 * ```
 */
export async function closeCSThread(threadId: string) {
  try {
    console.group("🔒 [admin/cs-reply] CS 티켓 종료 시작");
    console.log("threadId:", threadId);

    // 관리자 권한 확인
    const profile = await requireAdmin();
    console.log("✅ [admin/cs-reply] 관리자 확인:", profile.email);

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. CS 스레드 정보 조회 (현재 상태 확인)
    const { data: thread, error: threadError } = await supabase
      .from("cs_threads")
      .select("id, status")
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      console.error("❌ [admin/cs-reply] CS 스레드 조회 오류:", threadError);
      throw new Error("CS 문의를 찾을 수 없습니다.");
    }

    if (thread.status === "closed") {
      throw new Error("이미 종료된 티켓입니다.");
    }

    console.log("✅ [admin/cs-reply] CS 스레드 확인:", thread.status);

    // 2. cs_threads.status를 'closed'로 업데이트
    const closedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("cs_threads")
      .update({
        status: "closed",
        closed_at: closedAt,
        updated_at: closedAt,
      })
      .eq("id", threadId);

    if (updateError) {
      console.error("❌ [admin/cs-reply] 스레드 상태 업데이트 오류:", updateError);
      throw new Error("티켓을 종료하는 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin/cs-reply] 스레드 상태 업데이트 완료: closed");

    // 3. 감사 로그 기록
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: profile.id,
      action: "cs_close",
      target_type: "cs_thread",
      target_id: threadId,
      details: {
        thread_id: threadId,
        previous_status: thread.status,
        new_status: "closed",
        closed_at: closedAt,
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin/cs-reply] 감사 로그 기록 오류:", logError);
      // 감사 로그 실패는 치명적이지 않으므로 계속 진행
    } else {
      console.log("✅ [admin/cs-reply] 감사 로그 기록 완료");
    }

    console.log("✅ [admin/cs-reply] CS 티켓 종료 완료");
    console.groupEnd();

    // 캐시 무효화
    revalidatePath(`/admin/cs/${threadId}`);
    revalidatePath("/admin/cs");

    return { success: true };
  } catch (error) {
    console.error("❌ [admin/cs-reply] closeCSThread 예외:", error);
    throw error;
  }
}

